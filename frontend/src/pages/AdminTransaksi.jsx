import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../services/api";

export default function AdminTransaksi() {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("semua");
  const [modalKembali, setModalKembali] = useState(null);
  const [kondisi, setKondisi] = useState("baik");
  const [catatan, setCatatan] = useState("");
  const navigate = useNavigate();

  const confirmPayment = async (id) => {
  if (!confirm("Konfirmasi pembayaran sudah diterima?")) return;
  try {
    await API.put(`/admin/transactions/${id}/confirm-payment`);
    fetchTransactions();
  } catch (err) { console.error(err); }
};

  useEffect(() => {
    const role = localStorage.getItem("role");
    if (role !== "admin") navigate("/dashboard");
    fetchTransactions();
  }, []);

  const fetchTransactions = async () => {
    setLoading(true);
    try {
      const res = await API.get("/admin/transactions");
      setTransactions(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (id, status) => {
    try {
      await API.put(`/admin/transactions/${id}/status`, { status });
      fetchTransactions();
    } catch (err) { console.error(err); }
  };

  const handleAmbil = async (id) => {
    if (!confirm("Konfirmasi barang sudah diambil?")) return;
    try {
      await API.put(`/admin/transactions/${id}/ambil`);
      fetchTransactions();
    } catch (err) { console.error(err); }
  };

  const handleKembali = async () => {
    try {
      await API.put(`/admin/transactions/${modalKembali.id}/kembali`, { kondisi_kembali: kondisi, catatan });
      setModalKembali(null);
      setCatatan("");
      setKondisi("baik");
      fetchTransactions();
    } catch (err) { console.error(err); }
  };

  const formatHarga = (h) => "Rp " + Number(h).toLocaleString("id-ID");
  const formatDate = (d) => new Date(d).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" });
  const formatDateTime = (d) => new Date(d).toLocaleString("id-ID", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });

  const filtered = filter === "semua" ? transactions : transactions.filter(t => t.status === filter);

  const getStatusColor = (status) => {
    if (status === "pending") return { bg: "#ff990020", border: "#ff990040", color: "#ffaa00" };
    if (status === "approved") return { bg: "#0057ff20", border: "#0057ff40", color: "#0099ff" };
    if (status === "ongoing") return { bg: "#7c3aed20", border: "#7c3aed40", color: "#a78bfa" };
    if (status === "return_requested") return { bg: "#f59e0b20", border: "#f59e0b40", color: "#f59e0b" };
    if (status === "completed") return { bg: "#00c6ff20", border: "#00c6ff40", color: "#00c6ff" };
    if (status === "cancelled") return { bg: "#ff444420", border: "#ff444440", color: "#ff6b6b" };
    return { bg: "#071525", border: "#0d2440", color: "#4a6380" };
  };

  const getStatusLabel = (status) => {
    if (status === "pending") return "Pending";
    if (status === "approved") return "Approved";
    if (status === "ongoing") return "Ongoing";
    if (status === "return_requested") return "Minta Kembali";
    if (status === "completed") return "Completed";
    if (status === "cancelled") return "Cancelled";
    return status;
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=DM+Sans:wght@300;400;500&display=swap');
        * { margin: 0; padding: 0; box-sizing: border-box; }
        html, body, #root { height: 100%; width: 100%; }
        .at-root { min-height: 100vh; background: #020b18; font-family: 'DM Sans', sans-serif; color: #fff; }
        .at-nav { display: flex; align-items: center; justify-content: space-between; padding: 18px 48px; background: #040f1e; border-bottom: 1px solid #0d2440; position: sticky; top: 0; z-index: 100; }
        .at-nav-left { display: flex; align-items: center; gap: 16px; }
        .at-brand { font-family: 'Syne', sans-serif; font-size: 22px; font-weight: 800; cursor: pointer; }
        .at-brand span { color: #0057ff; }
        .at-badge { background: #0057ff20; border: 1px solid #0057ff40; color: #0099ff; font-size: 11px; padding: 3px 10px; border-radius: 20px; }
        .at-nav-tabs { display: flex; gap: 4px; }
        .at-tab { padding: 7px 16px; border-radius: 8px; border: none; background: transparent; color: #4a6380; font-size: 13px; cursor: pointer; font-family: 'DM Sans', sans-serif; transition: all 0.2s; }
        .at-tab:hover { color: #fff; background: #071525; }
        .at-tab.active { background: #071525; color: #fff; border: 1px solid #0d2440; }
        .at-logout { padding: 8px 18px; background: transparent; border: 1px solid #0d2440; border-radius: 8px; color: #4a6380; font-size: 13px; cursor: pointer; font-family: 'DM Sans', sans-serif; transition: all 0.2s; }
        .at-logout:hover { border-color: #ff4444; color: #ff4444; }
        .at-header { padding: 40px 48px 24px; }
        .at-header h1 { font-family: 'Syne', sans-serif; font-size: 32px; font-weight: 800; letter-spacing: -1px; margin-bottom: 6px; }
        .at-header h1 span { background: linear-gradient(135deg, #0057ff, #00c6ff); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; }
        .at-header p { color: #4a6380; font-size: 14px; }
        .at-stats { display: flex; gap: 16px; padding: 0 48px 28px; }
        .at-stat { background: #040f1e; border: 1px solid #0d2440; border-radius: 12px; padding: 16px 20px; flex: 1; }
        .at-stat-num { font-family: 'Syne', sans-serif; font-size: 24px; font-weight: 700; margin-bottom: 4px; }
        .at-stat-label { font-size: 12px; color: #4a6380; }
        .at-filter { display: flex; gap: 8px; padding: 0 48px 20px; flex-wrap: wrap; }
        .at-filter-btn { padding: 8px 18px; border-radius: 8px; border: 1px solid #0d2440; background: transparent; color: #4a6380; font-size: 13px; cursor: pointer; font-family: 'DM Sans', sans-serif; transition: all 0.2s; }
        .at-filter-btn:hover { border-color: #0057ff; color: #0099ff; }
        .at-filter-btn.active { background: #0057ff; border-color: #0057ff; color: #fff; }
        .at-table-wrap { padding: 0 48px 48px; overflow-x: auto; }
        .at-table { width: 100%; border-collapse: collapse; }
        .at-table th { text-align: left; font-size: 11px; text-transform: uppercase; letter-spacing: 1px; color: #4a6380; font-weight: 500; padding: 12px 16px; border-bottom: 1px solid #0d2440; white-space: nowrap; }
        .at-table td { padding: 12px 16px; border-bottom: 1px solid #071525; font-size: 13px; vertical-align: middle; }
        .at-table tr:hover td { background: #040f1e; }
        .at-no { font-family: 'Syne', sans-serif; font-size: 13px; color: #4a6380; }
        .at-user { font-weight: 500; color: #fff; margin-bottom: 2px; }
        .at-email { font-size: 11px; color: #4a6380; }
        .at-produk { font-weight: 500; color: #fff; margin-bottom: 2px; }
        .at-kat { font-size: 11px; }
        .at-kat.hp { color: #0099ff; }
        .at-kat.kamera { color: #a78bfa; }
        .at-date { font-size: 12px; color: #cdd6e0; }
        .at-date-sep { color: #4a6380; margin: 0 4px; }
        .at-harga { font-family: 'Syne', sans-serif; font-size: 14px; color: #0099ff; font-weight: 600; }
        .at-pay-badge { display: inline-block; padding: 4px 10px; border-radius: 6px; font-size: 11px; font-weight: 500; white-space: nowrap; }
        .at-pay-badge.unpaid { background: #ff990020; border: 1px solid #ff990040; color: #ffaa00; }
        .at-pay-badge.paid { background: #00c6ff20; border: 1px solid #00c6ff40; color: #00c6ff; }
        .at-pay-badge.expired { background: #ff444420; border: 1px solid #ff444440; color: #ff6b6b; }
        .at-status-badge { display: inline-block; padding: 4px 10px; border-radius: 6px; font-size: 11px; font-weight: 500; white-space: nowrap; }
        .at-status-select { padding: 6px 10px; background: #071525; border: 1px solid #0d2440; border-radius: 6px; color: #fff; font-size: 12px; font-family: 'DM Sans', sans-serif; cursor: pointer; outline: none; }
        .at-status-select option { background: #040f1e; }
        .at-actions { display: flex; gap: 6px; flex-wrap: wrap; }
        .at-btn { padding: 5px 12px; border-radius: 6px; font-size: 11px; cursor: pointer; font-family: 'DM Sans', sans-serif; transition: all 0.2s; border: 1px solid; }
        .at-btn-ambil { background: #0057ff20; border-color: #0057ff40; color: #0099ff; }
        .at-btn-ambil:hover { background: #0057ff40; }
        .at-btn-kembali { background: #7c3aed20; border-color: #7c3aed40; color: #a78bfa; }
        .at-btn-kembali:hover { background: #7c3aed40; }
        .at-btn-konfirmasi { background: #f59e0b20; border-color: #f59e0b40; color: #f59e0b; }
        .at-btn-konfirmasi:hover { background: #f59e0b40; }
        .at-datetime { font-size: 11px; color: #4a6380; margin-top: 2px; }
        .at-kondisi { font-size: 11px; padding: 2px 8px; border-radius: 4px; }
        .at-kondisi.baik { background: #00c6ff15; color: #00c6ff; }
        .at-kondisi.rusak { background: #ff990015; color: #ffaa00; }
        .at-kondisi.hilang { background: #ff444415; color: #ff6b6b; }
        .at-loading { text-align: center; padding: 80px; color: #4a6380; }
        .at-empty { text-align: center; padding: 60px; color: #4a6380; }
        .at-overlay { position: fixed; inset: 0; background: #00000080; z-index: 200; display: flex; align-items: center; justify-content: center; }
        .at-modal { background: #040f1e; border: 1px solid #0d2440; border-radius: 16px; padding: 32px; width: 440px; position: relative; }
        .at-modal::before { content: ''; position: absolute; top: 0; left: 0; right: 0; height: 2px; background: linear-gradient(90deg, transparent, #0057ff, #00c6ff, transparent); border-radius: 16px 16px 0 0; }
        .at-modal h3 { font-family: 'Syne', sans-serif; font-size: 20px; font-weight: 700; margin-bottom: 20px; }
        .at-modal-field { margin-bottom: 16px; }
        .at-modal-field label { display: block; font-size: 12px; text-transform: uppercase; letter-spacing: 1px; color: #4a6380; margin-bottom: 6px; }
        .at-modal-field select, .at-modal-field textarea { width: 100%; padding: 12px 14px; background: #071525; border: 1px solid #0d2440; border-radius: 8px; color: #fff; font-size: 14px; font-family: 'DM Sans', sans-serif; outline: none; }
        .at-modal-field textarea { resize: vertical; min-height: 80px; }
        .at-modal-field select option { background: #040f1e; }
        .at-modal-footer { display: flex; gap: 10px; margin-top: 20px; }
        .at-modal-save { flex: 1; padding: 12px; background: linear-gradient(135deg, #0057ff, #0099ff); color: #fff; border: none; border-radius: 8px; font-size: 14px; font-weight: 500; cursor: pointer; font-family: 'DM Sans', sans-serif; }
        .at-modal-cancel { padding: 12px 20px; background: transparent; border: 1px solid #0d2440; border-radius: 8px; color: #4a6380; font-size: 14px; cursor: pointer; font-family: 'DM Sans', sans-serif; }
        .at-modal-cancel:hover { border-color: #ff4444; color: #ff4444; }
      `}</style>

      <div className="at-root">
        <nav className="at-nav">
          <div className="at-nav-left">
            <div className="at-brand" onClick={() => navigate("/admin")}>Rent<span>Tech</span></div>
            <span className="at-badge">Admin</span>
            <div className="at-nav-tabs">
              <button className="at-tab" onClick={() => navigate("/admin")}>Produk</button>
              <button className="at-tab active">Transaksi</button>
            </div>
          </div>
          <button className="at-logout" onClick={() => { localStorage.clear(); navigate("/login"); }}>Keluar</button>
        </nav>

        <div className="at-header">
          <h1>Manajemen <span>Transaksi</span></h1>
          <p>Pantau semua data penyewaan dan pembayaran</p>
        </div>

        <div className="at-stats">
          <div className="at-stat">
            <div className="at-stat-num" style={{color:"#fff"}}>{transactions.length}</div>
            <div className="at-stat-label">Total Transaksi</div>
          </div>
          <div className="at-stat">
            <div className="at-stat-num" style={{color:"#00c6ff"}}>{transactions.filter(t => t.payment_status === "paid").length}</div>
            <div className="at-stat-label">Sudah Lunas</div>
          </div>
          <div className="at-stat">
            <div className="at-stat-num" style={{color:"#ffaa00"}}>{transactions.filter(t => t.payment_status === "unpaid").length}</div>
            <div className="at-stat-label">Belum Bayar</div>
          </div>
          <div className="at-stat">
            <div className="at-stat-num" style={{color:"#0099ff"}}>
              {formatHarga(transactions.filter(t => t.payment_status === "paid").reduce((a, b) => a + Number(b.total_harga), 0))}
            </div>
            <div className="at-stat-label">Total Pendapatan</div>
          </div>
        </div>

        <div className="at-filter">
          {["semua", "pending", "approved", "ongoing", "return_requested", "completed", "cancelled"].map(f => (
            <button key={f} className={`at-filter-btn ${filter === f ? "active" : ""}`} onClick={() => setFilter(f)}
              style={f === "return_requested" && transactions.filter(t => t.status === "return_requested").length > 0 ? {borderColor:"#f59e0b40", color:"#f59e0b"} : {}}>
              {f === "semua" ? "Semua" : f === "return_requested" ? `Minta Kembali ${transactions.filter(t => t.status === "return_requested").length > 0 ? `(${transactions.filter(t => t.status === "return_requested").length})` : ""}` : f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>

        <div className="at-table-wrap">
          {loading ? (
            <div className="at-loading">Memuat data...</div>
          ) : filtered.length === 0 ? (
            <div className="at-empty">Tidak ada transaksi</div>
          ) : (
            <table className="at-table">
              <thead>
                <tr>
                  <th>No</th>
                  <th>Penyewa</th>
                  <th>Produk</th>
                  <th>Tanggal Sewa</th>
                  <th>Total</th>
                  <th>Bayar</th>
                  <th>Status</th>
                  <th>Pengambilan</th>
                  <th>Pengembalian</th>
                  <th>Aksi</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((t) => {
                  const sc = getStatusColor(t.status);
                  return (
                    <tr key={t.id}>
                      <td className="at-no">#{String(t.id).padStart(4, "0")}</td>
                      <td>
                        <div className="at-user">{t.nama_user}</div>
                        <div className="at-email">{t.email}</div>
                      </td>
                      <td>
                        <div className="at-produk">{t.nama_produk}</div>
                        <div className={`at-kat ${t.nama_kategori === "HP" ? "hp" : "kamera"}`}>{t.nama_kategori}</div>
                      </td>
                      <td>
                        <div className="at-date">
                          {formatDate(t.tanggal_mulai)}
                          <span className="at-date-sep">→</span>
                          {formatDate(t.tanggal_selesai)}
                        </div>
                      </td>
                      <td className="at-harga">{formatHarga(t.total_harga)}</td>
                     <td>
                       <span className={`at-pay-badge ${t.payment_status}`}>
                        {t.payment_status === "unpaid" ? "Belum Lunas" : t.payment_status === "paid" ? "Lunas" : "Kadaluarsa"}
                      </span>
                      {t.bukti_bayar && t.payment_status === "unpaid" && (
                        <div style={{marginTop:6, display:"flex", flexDirection:"column", gap:4}}>
                        <a href={`${import.meta.env.VITE_API_URL}/uploads/${t.bukti_bayar}`} target="_blank" rel="noreferrer" style={{fontSize:11, color:"#0099ff"}}>
                         🖼 Lihat Bukti
                         </a>
                       <button className="at-btn at-btn-ambil" onClick={() => confirmPayment(t.id)}>✓ Konfirmasi Lunas</button>
                        </div>
                      )}
                      </td>
                      <td>
                        {["pending", "approved"].includes(t.status) ? (
                          <select
                            className="at-status-select"
                            value={t.status}
                            onChange={(e) => updateStatus(t.id, e.target.value)}
                          >
                            <option value="pending">Pending</option>
                            <option value="approved">Approved</option>
                            <option value="cancelled">Cancelled</option>
                          </select>
                        ) : (
                          <span className="at-status-badge" style={{background: sc.bg, border: `1px solid ${sc.border}`, color: sc.color}}>
                            {getStatusLabel(t.status)}
                          </span>
                        )}
                      </td>
                      <td>
                        {t.tanggal_pengambilan ? (
                          <div className="at-datetime">{formatDateTime(t.tanggal_pengambilan)}</div>
                        ) : <span style={{color:"#4a6380", fontSize:12}}>-</span>}
                      </td>
                      <td>
                        {t.tanggal_pengembalian_aktual ? (
                          <div>
                            <div className="at-datetime">{formatDateTime(t.tanggal_pengembalian_aktual)}</div>
                            {t.kondisi_kembali && <span className={`at-kondisi ${t.kondisi_kembali}`}>{t.kondisi_kembali}</span>}
                          </div>
                        ) : <span style={{color:"#4a6380", fontSize:12}}>-</span>}
                      </td>
                      <td>
                        <div className="at-actions">
                          {t.status === "approved" && !t.tanggal_pengambilan && (
                            <button className="at-btn at-btn-ambil" onClick={() => handleAmbil(t.id)}>✓ Diambil</button>
                          )}
                          {t.status === "ongoing" && !t.tanggal_pengembalian_aktual && (
                            <button className="at-btn at-btn-kembali" onClick={() => setModalKembali(t)}>↩ Dikembalikan</button>
                          )}
                          {t.status === "return_requested" && (
                            <button className="at-btn at-btn-konfirmasi" onClick={() => setModalKembali(t)}>⚠ Konfirmasi Kembali</button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {modalKembali && (
        <div className="at-overlay">
          <div className="at-modal">
            <h3>Catat Pengembalian</h3>
            <p style={{fontSize:13, color:"#4a6380", marginBottom:20}}>
              {modalKembali.nama_produk} — {modalKembali.nama_user}
            </p>
            <div className="at-modal-field">
              <label>Kondisi Barang</label>
              <select value={kondisi} onChange={(e) => setKondisi(e.target.value)}>
                <option value="baik">Baik</option>
                <option value="rusak">Rusak</option>
                <option value="hilang">Hilang</option>
              </select>
            </div>
            <div className="at-modal-field">
              <label>Catatan (opsional)</label>
              <textarea placeholder="Catatan kondisi barang..." value={catatan} onChange={(e) => setCatatan(e.target.value)} />
            </div>
            <div className="at-modal-footer">
              <button className="at-modal-cancel" onClick={() => setModalKembali(null)}>Batal</button>
              <button className="at-modal-save" onClick={handleKembali}>Simpan Pengembalian</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}