import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../services/api";

export default function AdminDashboard() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editData, setEditData] = useState(null);
  const [form, setForm] = useState({ category_id: "", nama_produk: "", deskripsi: "", harga_sewa: "", stok: "", gambar: "" });
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const navigate = useNavigate();

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const res = await API.get("/products");
      setProducts(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const res = await API.get("/categories");
      setCategories(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    const role = localStorage.getItem("role");
    if (role !== "admin") navigate("/dashboard");
    fetchProducts();
    fetchCategories();
  }, []);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async () => {
  try {
    const formData = new FormData();
    formData.append("category_id", form.category_id);
    formData.append("nama_produk", form.nama_produk);
    formData.append("deskripsi", form.deskripsi);
    formData.append("harga_sewa", form.harga_sewa);
    formData.append("stok", form.stok);
    if (imageFile) formData.append("gambar", imageFile);
    else if (form.gambar) formData.append("gambar", form.gambar);

    if (editData) {
      await API.put(`/products/${editData.id}`, formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });
    } else {
      await API.post("/products", formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });
    }
    setShowModal(false);
    setEditData(null);
    setForm({ category_id: "", nama_produk: "", deskripsi: "", harga_sewa: "", stok: "", gambar: "" });
    setImageFile(null);
    setImagePreview(null);
    fetchProducts();
  } catch (err) {
    console.error(err);
  }
};

 const handleEdit = (p) => {
  setEditData(p);
  setForm({ category_id: p.category_id, nama_produk: p.nama_produk, deskripsi: p.deskripsi, harga_sewa: p.harga_sewa, stok: p.stok, gambar: p.gambar });
  setImagePreview(p.gambar ? `${import.meta.env.VITE_API_URL}/uploads/${p.gambar}` : null);
  setImageFile(null);
  setShowModal(true);
};

  const handleDelete = async (id) => {
    if (!confirm("Hapus produk ini?")) return;
    await API.delete(`/products/${id}`);
    fetchProducts();
  };

  const logout = () => { localStorage.clear(); navigate("/login"); };
  const formatHarga = (h) => "Rp " + Number(h).toLocaleString("id-ID");

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=DM+Sans:wght@300;400;500&display=swap');
        * { margin: 0; padding: 0; box-sizing: border-box; }
        html, body, #root { height: 100%; width: 100%; }

        .ad-root { min-height: 100vh; background: #020b18; font-family: 'DM Sans', sans-serif; color: #fff; }

        .ad-nav { display: flex; align-items: center; justify-content: space-between; padding: 18px 48px; background: #040f1e; border-bottom: 1px solid #0d2440; position: sticky; top: 0; z-index: 100; }
        .ad-brand { font-family: 'Syne', sans-serif; font-size: 22px; font-weight: 800; }
        .ad-brand span { color: #0057ff; }
        .ad-badge { background: #0057ff20; border: 1px solid #0057ff40; color: #0099ff; font-size: 11px; padding: 3px 10px; border-radius: 20px; margin-left: 10px; }
        .ad-nav-right { display: flex; gap: 12px; }
        .ad-logout { padding: 8px 18px; background: transparent; border: 1px solid #0d2440; border-radius: 8px; color: #4a6380; font-size: 13px; cursor: pointer; font-family: 'DM Sans', sans-serif; transition: all 0.2s; }
        .ad-logout:hover { border-color: #ff4444; color: #ff4444; }

        .ad-header { padding: 40px 48px 24px; }
        .ad-header h1 { font-family: 'Syne', sans-serif; font-size: 32px; font-weight: 800; letter-spacing: -1px; margin-bottom: 6px; }
        .ad-header h1 span { background: linear-gradient(135deg, #0057ff, #00c6ff); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; }
        .ad-header p { color: #4a6380; font-size: 14px; }

        .ad-toolbar { display: flex; justify-content: space-between; align-items: center; padding: 0 48px 24px; }
        .ad-count { font-size: 14px; color: #4a6380; }
        .ad-add-btn { padding: 10px 22px; background: linear-gradient(135deg, #0057ff, #0099ff); color: #fff; border: none; border-radius: 8px; font-size: 14px; font-weight: 500; cursor: pointer; font-family: 'DM Sans', sans-serif; transition: all 0.2s; }
        .ad-add-btn:hover { transform: translateY(-1px); box-shadow: 0 6px 20px #0057ff40; }

        .ad-table-wrap { padding: 0 48px 48px; overflow-x: auto; }
        .ad-table { width: 100%; border-collapse: collapse; }
        .ad-table th { text-align: left; font-size: 11px; text-transform: uppercase; letter-spacing: 1px; color: #4a6380; font-weight: 500; padding: 12px 16px; border-bottom: 1px solid #0d2440; }
        .ad-table td { padding: 14px 16px; border-bottom: 1px solid #071525; font-size: 14px; vertical-align: middle; }
        .ad-table tr:hover td { background: #040f1e; }

        .ad-cat-badge { display: inline-block; padding: 3px 10px; border-radius: 6px; font-size: 11px; font-weight: 500; text-transform: uppercase; letter-spacing: 0.5px; }
        .ad-cat-hp { background: #0057ff20; color: #0099ff; border: 1px solid #0057ff30; }
        .ad-cat-kamera { background: #7c3aed20; color: #a78bfa; border: 1px solid #7c3aed30; }

        .ad-harga { color: #0099ff; font-weight: 500; }
        .ad-stok { font-size: 12px; padding: 3px 10px; border-radius: 6px; background: #071525; border: 1px solid #0d2440; color: #4a6380; }
        .ad-stok.ok { border-color: #00c6ff30; color: #00c6ff; }

        .ad-actions { display: flex; gap: 8px; }
        .ad-edit-btn { padding: 6px 14px; background: #071525; border: 1px solid #0d2440; border-radius: 6px; color: #4a6380; font-size: 12px; cursor: pointer; font-family: 'DM Sans', sans-serif; transition: all 0.2s; }
        .ad-edit-btn:hover { border-color: #0057ff; color: #0099ff; }
        .ad-del-btn { padding: 6px 14px; background: #1a0a0a; border: 1px solid #ff444430; border-radius: 6px; color: #ff6b6b; font-size: 12px; cursor: pointer; font-family: 'DM Sans', sans-serif; transition: all 0.2s; }
        .ad-del-btn:hover { background: #ff444420; }

        .ad-loading { text-align: center; padding: 80px; color: #4a6380; }

        /* MODAL */
        .ad-overlay { position: fixed; inset: 0; background: #00000080; z-index: 200; display: flex; align-items: center; justify-content: center; }
        .ad-modal { background: #040f1e; border: 1px solid #0d2440; border-radius: 16px; padding: 36px; width: 480px; position: relative; max-height: 90vh; overflow-y: auto;}
        .ad-modal::before { content: ''; position: absolute; top: 0; left: 0; right: 0; height: 2px; background: linear-gradient(90deg, transparent, #0057ff, #00c6ff, transparent); border-radius: 16px 16px 0 0; }
        .ad-modal h3 { font-family: 'Syne', sans-serif; font-size: 22px; font-weight: 700; margin-bottom: 24px; letter-spacing: -0.5px; }
        .ad-field { margin-bottom: 16px; }
        .ad-field label { display: block; font-size: 12px; text-transform: uppercase; letter-spacing: 1px; color: #4a6380; font-weight: 500; margin-bottom: 6px; }
        .ad-field input, .ad-field select, .ad-field textarea { width: 100%; padding: 12px 14px; background: #071525; border: 1px solid #0d2440; border-radius: 8px; color: #fff; font-size: 14px; font-family: 'DM Sans', sans-serif; outline: none; transition: all 0.2s; }
        .ad-field input:focus, .ad-field select:focus, .ad-field textarea:focus { border-color: #0057ff; box-shadow: 0 0 0 3px #0057ff18; }
        .ad-field select option { background: #040f1e; }
        .ad-field textarea { resize: vertical; min-height: 80px; }
        .ad-modal-footer { display: flex; gap: 10px; margin-top: 24px; }
        .ad-save-btn { flex: 1; padding: 12px; background: linear-gradient(135deg, #0057ff, #0099ff); color: #fff; border: none; border-radius: 8px; font-size: 14px; font-weight: 500; cursor: pointer; font-family: 'DM Sans', sans-serif; }
        .ad-cancel-btn { padding: 12px 20px; background: transparent; border: 1px solid #0d2440; border-radius: 8px; color: #4a6380; font-size: 14px; cursor: pointer; font-family: 'DM Sans', sans-serif; }
        .ad-cancel-btn:hover { border-color: #ff4444; color: #ff4444; }
      `}</style>

      <div className="ad-root">
        <nav className="ad-nav">
        <div style={{display:"flex", alignItems:"center", gap:12}}>
        <div className="ad-brand">
          Rent<span>Tech</span>
        <span className="ad-badge">Admin</span>
        </div>
        <div style={{display:"flex", gap:4, marginLeft:8}}>
          <button style={{padding:"7px 16px", borderRadius:8, border:"1px solid #0d2440", background:"#071525", color:"#fff", fontSize:13, cursor:"pointer", fontFamily:"'DM Sans', sans-serif"}} onClick={() => navigate("/admin")}>Produk</button>
          <button style={{padding:"7px 16px", borderRadius:8, border:"none", background:"transparent", color:"#4a6380", fontSize:13, cursor:"pointer", fontFamily:"'DM Sans', sans-serif"}} onClick={() => navigate("/admin/transaksi")}>Transaksi</button>
        </div>
      </div>
        <div className="ad-nav-right">
        <button className="ad-logout" onClick={logout}>Keluar</button>
      </div>
      </nav>
        <div className="ad-header">
          <h1>Manajemen <span>Produk</span></h1>
          <p>Kelola semua produk HP dan Kamera</p>
        </div>

        <div className="ad-toolbar">
          <span className="ad-count">{products.length} produk terdaftar</span>
          <button className="ad-add-btn" onClick={() => { setEditData(null); setForm({ category_id: "", nama_produk: "", deskripsi: "", harga_sewa: "", stok: "", gambar: "" }); setShowModal(true); }}>
            + Tambah Produk
          </button>
        </div>

        <div className="ad-table-wrap">
          {loading ? (
            <div className="ad-loading">Memuat data...</div>
          ) : (
            <table className="ad-table">
              <thead>
                <tr>
                  <th>Produk</th>
                  <th>Kategori</th>
                  <th>Harga/Hari</th>
                  <th>Stok</th>
                  <th>Aksi</th>
                </tr>
              </thead>
              <tbody>
                {products.map((p) => (
                  <tr key={p.id}>
                    <td>
                      <div style={{ fontWeight: 500 }}>{p.nama_produk}</div>
                      <div style={{ fontSize: 12, color: "#4a6380", marginTop: 2 }}>{p.deskripsi?.slice(0, 50)}...</div>
                    </td>
                    <td>
                      <span className={`ad-cat-badge ${p.nama_kategori === "HP" ? "ad-cat-hp" : "ad-cat-kamera"}`}>
                        {p.nama_kategori}
                      </span>
                    </td>
                    <td className="ad-harga">{formatHarga(p.harga_sewa)}</td>
                    <td><span className={`ad-stok ${p.stok > 0 ? "ok" : ""}`}>{p.stok}</span></td>
                    <td>
                      <div className="ad-actions">
                        <button className="ad-edit-btn" onClick={() => handleEdit(p)}>Edit</button>
                        <button className="ad-del-btn" onClick={() => handleDelete(p.id)}>Hapus</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {showModal && (
        <div className="ad-overlay">
          <div className="ad-modal">
            <h3>{editData ? "Edit Produk" : "Tambah Produk"}</h3>
            <div className="ad-field">
              <label>Kategori</label>
              <select name="category_id" value={form.category_id} onChange={handleChange}>
                <option value="">Pilih kategori</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>{c.nama_kategori}</option>
                ))}
              </select>
            </div>
            <div className="ad-field">
              <label>Nama Produk</label>
              <input name="nama_produk" value={form.nama_produk} placeholder="iPhone 14 Pro" onChange={handleChange} />
            </div>
            <div className="ad-field">
              <label>Deskripsi</label>
              <textarea name="deskripsi" value={form.deskripsi} placeholder="Deskripsi produk..." onChange={handleChange} />
            </div>
            <div style={{ display: "flex", gap: 12 }}>
              <div className="ad-field" style={{ flex: 1 }}>
                <label>Harga/Hari</label>
                <input name="harga_sewa" type="number" value={form.harga_sewa} placeholder="150000" onChange={handleChange} />
              </div>
              <div className="ad-field" style={{ flex: 1 }}>
                <label>Stok</label>
                <input name="stok" type="number" value={form.stok} placeholder="3" onChange={handleChange} />
              </div>
            </div>
           <div className="ad-field">
  <label>Gambar Produk</label>
  <label style={{
    display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
    border: "2px dashed #0d2440", borderRadius: 8, padding: 20, cursor: "pointer",
    background: "#071525"
  }}>
    {imagePreview ? (
      <img src={imagePreview} alt="preview" style={{ width: "100%", maxHeight: 160, objectFit: "cover", borderRadius: 6 }} />
    ) : (
      <>
        <div style={{ fontSize: 32 }}>📷</div>
        <div style={{ color: "#4a6380", fontSize: 13, marginTop: 8 }}>Klik untuk upload gambar</div>
      </>
    )}
    <input type="file" accept="image/*" style={{ display: "none" }} onChange={(e) => {
      const file = e.target.files[0];
      if (file) { setImageFile(file); setImagePreview(URL.createObjectURL(file)); }
    }} />
  </label>
</div>
            <div className="ad-modal-footer">
              <button className="ad-cancel-btn" onClick={() => setShowModal(false)}>Batal</button>
              <button className="ad-save-btn" onClick={handleSubmit}>{editData ? "Simpan Perubahan" : "Tambah Produk"}</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}