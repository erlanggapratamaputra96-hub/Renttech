const db = require("../config/db");

const getAllProducts = (req, res) => {
  const { kategori } = req.query;
  let sql = "SELECT p.*, c.nama_kategori FROM products p LEFT JOIN categories c ON p.category_id = c.id";
  const params = [];
  if (kategori) {
    sql += " WHERE c.nama_kategori = ?";
    params.push(kategori);
  }
  db.query(sql, params, (err, result) => {
    if (err) return res.status(500).json(err);
    res.json(result);
  });
};

const getProductById = (req, res) => {
  db.query("SELECT * FROM products WHERE id = ?", [req.params.id], (err, result) => {
    if (err) return res.status(500).json(err);
    if (result.length === 0) return res.status(404).json({ message: "Produk tidak ditemukan" });
    res.json(result[0]);
  });
};

const addProduct = (req, res) => {
  const { category_id, nama_produk, deskripsi, harga_sewa, stok, gambar } = req.body;
  db.query(
    "INSERT INTO products (category_id, nama_produk, deskripsi, harga_sewa, stok, gambar) VALUES (?,?,?,?,?,?)",
    [category_id, nama_produk, deskripsi, harga_sewa, stok, gambar],
    (err, result) => {
      if (err) return res.status(500).json(err);
      res.json({ message: "Produk berhasil ditambahkan", id: result.insertId });
    }
  );
};

const editProduct = (req, res) => {
  const { category_id, nama_produk, deskripsi, harga_sewa, stok, gambar } = req.body;
  db.query(
    "UPDATE products SET category_id=?, nama_produk=?, deskripsi=?, harga_sewa=?, stok=?, gambar=? WHERE id=?",
    [category_id, nama_produk, deskripsi, harga_sewa, stok, gambar, req.params.id],
    (err) => {
      if (err) return res.status(500).json(err);
      res.json({ message: "Produk berhasil diupdate" });
    }
  );
};

const deleteProduct = (req, res) => {
  db.query("DELETE FROM products WHERE id=?", [req.params.id], (err) => {
    if (err) return res.status(500).json(err);
    res.json({ message: "Produk berhasil dihapus" });
  });
};

module.exports = { getAllProducts, getProductById, addProduct, editProduct, deleteProduct };