const addProduct = (req, res) => {
  const { category_id, nama_produk, deskripsi, harga_sewa, stok } = req.body;
  const gambar = req.file ? req.file.filename : null;
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
  const { category_id, nama_produk, deskripsi, harga_sewa, stok } = req.body;
  const gambar = req.file ? req.file.filename : req.body.gambar;
  db.query(
    "UPDATE products SET category_id=?, nama_produk=?, deskripsi=?, harga_sewa=?, stok=?, gambar=? WHERE id=?",
    [category_id, nama_produk, deskripsi, harga_sewa, stok, gambar, req.params.id],
    (err) => {
      if (err) return res.status(500).json(err);
      res.json({ message: "Produk berhasil diupdate" });
    }
  );
};