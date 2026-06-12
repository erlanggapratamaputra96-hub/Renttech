const express = require("express");
const router = express.Router();
const db = require("../config/db");

router.get("/transactions", (req, res) => {
  db.query(
    `SELECT r.id, r.tanggal_mulai, r.tanggal_selesai, r.total_harga, 
r.status, r.payment_status, r.alamat_pickup, r.created_at,
r.tanggal_pengambilan, r.tanggal_pengembalian_aktual,
r.kondisi_kembali, r.catatan, r.bukti_bayar,
u.nama as nama_user, u.email,
p.id as product_id, p.nama_produk, c.nama_kategori
FROM rentals r
JOIN users u ON r.user_id = u.id
JOIN products p ON r.product_id = p.id
JOIN categories c ON p.category_id = c.id
ORDER BY r.created_at DESC`,
    (err, result) => {
      if (err) return res.status(500).json(err);
      res.json(result);
    }
  );
});

router.put("/transactions/:id/status", (req, res) => {
  const { status } = req.body;
  db.query("UPDATE rentals SET status = ? WHERE id = ?", [status, req.params.id], (err) => {
    if (err) return res.status(500).json(err);
    res.json({ message: "Status diperbarui" });
  });
});

router.put("/transactions/:id/ambil", (req, res) => {
  const tanggal_pengambilan = new Date();
  db.query(
    "UPDATE rentals SET tanggal_pengambilan = ?, status = 'ongoing' WHERE id = ?",
    [tanggal_pengambilan, req.params.id],
    (err) => {
      if (err) return res.status(500).json(err);
      res.json({ message: "Status pengambilan diperbarui" });
    }
  );
});

router.put("/transactions/:id/kembali", (req, res) => {
  const { kondisi_kembali, catatan } = req.body;
  const tanggal_pengembalian_aktual = new Date();

  db.query("SELECT product_id FROM rentals WHERE id = ?", [req.params.id], (err, result) => {
    if (err) return res.status(500).json(err);
    if (result.length === 0) return res.status(404).json({ message: "Tidak ditemukan" });

    const product_id = result[0].product_id;

    db.query(
      "UPDATE rentals SET tanggal_pengembalian_aktual = ?, kondisi_kembali = ?, catatan = ?, status = 'completed' WHERE id = ?",
      [tanggal_pengembalian_aktual, kondisi_kembali, catatan, req.params.id],
      (err2) => {
        if (err2) return res.status(500).json(err2);

        // Tambah stok produk
        db.query("UPDATE products SET stok = stok + 1 WHERE id = ?", [product_id], (err3) => {
          if (err3) return res.status(500).json(err3);
          res.json({ message: "Pengembalian dicatat, stok bertambah" });
        });
      }
    );
  });
});

router.put("/transactions/:id/confirm-payment", (req, res) => {
  db.query("UPDATE rentals SET payment_status = 'paid' WHERE id = ?", [req.params.id], (err) => {
    if (err) return res.status(500).json(err);
    res.json({ message: "Pembayaran dikonfirmasi" });
  });
});

module.exports = router;