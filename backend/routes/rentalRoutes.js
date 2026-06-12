const express = require("express");
const router = express.Router();
const db = require("../config/db");
const multer = require("multer");
const path = require("path");

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "./uploads/"),
  filename: (req, file, cb) => cb(null, `bukti-${Date.now()}${path.extname(file.originalname)}`)
});
const upload = multer({ storage });

// Buat booking baru
router.post("/", (req, res) => {
  const { user_id, product_id, tanggal_mulai, tanggal_selesai, latitude, longitude, alamat_pickup } = req.body;
  const days = Math.ceil((new Date(tanggal_selesai) - new Date(tanggal_mulai)) / (1000 * 60 * 60 * 24));
  const payment_deadline = new Date(Date.now() + 10 * 60 * 1000);

  db.query("SELECT harga_sewa FROM products WHERE id = ?", [product_id], (err, result) => {
    if (err) return res.status(500).json(err);
    if (result.length === 0) return res.status(404).json({ message: "Produk tidak ditemukan" });

    const total_harga = days * result[0].harga_sewa;
   db.query(
  "INSERT INTO rentals (user_id, product_id, tanggal_mulai, tanggal_selesai, total_harga, latitude, longitude, alamat_pickup, payment_status, payment_deadline) VALUES (?,?,?,?,?,?,?,?,?,?)",
  [user_id, product_id, tanggal_mulai, tanggal_selesai, total_harga, latitude, longitude, alamat_pickup, "unpaid", payment_deadline],
  (err2, result2) => {
    if (err2) return res.status(500).json(err2);

    db.query("UPDATE products SET stok = stok - 1 WHERE id = ?", [product_id], (err3) => {
      if (err3) console.error(err3);
      res.json({ message: "Booking berhasil", id: result2.insertId, total_harga, payment_deadline });
    });
  }
);
  });
});

// Get by user — harus sebelum /:id
router.get("/user/:user_id", (req, res) => {
  db.query(
    "SELECT r.*, p.nama_produk, p.gambar, c.nama_kategori FROM rentals r JOIN products p ON r.product_id = p.id JOIN categories c ON p.category_id = c.id WHERE r.user_id = ? ORDER BY r.created_at DESC",
    [req.params.user_id],
    (err, result) => {
      if (err) return res.status(500).json(err);
      res.json(result);
    }
  );
});

// Return request — harus sebelum /:id
router.put("/:id/return-request", (req, res) => {
  db.query(
    "UPDATE rentals SET status = 'return_requested' WHERE id = ? AND status = 'ongoing'",
    [req.params.id],
    (err, result) => {
      if (err) return res.status(500).json(err);
      if (result.affectedRows === 0) return res.status(400).json({ message: "Status tidak bisa diubah" });
      res.json({ message: "Pengajuan pengembalian berhasil" });
    }
  );
});

// Bayar — harus sebelum /:id
router.put("/:id/pay", (req, res) => {
  db.query("SELECT * FROM rentals WHERE id = ?", [req.params.id], (err, result) => {
    if (err) return res.status(500).json(err);
    if (result.length === 0) return res.status(404).json({ message: "Tidak ditemukan" });

    const rental = result[0];
    if (new Date() > new Date(rental.payment_deadline)) {
      db.query("UPDATE rentals SET payment_status = 'expired' WHERE id = ?", [rental.id]);
      return res.status(400).json({ message: "Waktu pembayaran sudah habis, transaksi dibatalkan" });
    }

    db.query("UPDATE rentals SET payment_status = 'paid' WHERE id = ?", [rental.id], (err2) => {
      if (err2) return res.status(500).json(err2);
      res.json({ message: "Pembayaran berhasil" });
    });
  });
});

// Get by ID — harus paling bawah
router.get("/:id", (req, res) => {
  db.query(
    "SELECT r.*, p.nama_produk, p.harga_sewa, p.category_id FROM rentals r JOIN products p ON r.product_id = p.id WHERE r.id = ?",
    [req.params.id],
    (err, result) => {
      if (err) return res.status(500).json(err);
      if (result.length === 0) return res.status(404).json({ message: "Rental tidak ditemukan" });

      const rental = result[0];
      if (rental.payment_status === "unpaid" && new Date() > new Date(rental.payment_deadline)) {
        db.query("UPDATE rentals SET payment_status = 'expired' WHERE id = ?", [rental.id]);
        rental.payment_status = "expired";
      }
      res.json(rental);
    }
  );
});

// Upload bukti bayar
router.post("/:id/upload-bukti", upload.single("bukti"), (req, res) => {
  if (!req.file) return res.status(400).json({ message: "File tidak ditemukan" });
  const bukti_bayar = req.file.filename;
  db.query("UPDATE rentals SET bukti_bayar = ? WHERE id = ?", [bukti_bayar, req.params.id], (err) => {
    if (err) return res.status(500).json(err);
    res.json({ message: "Bukti berhasil diupload", bukti_bayar });
  });
});

module.exports = router;