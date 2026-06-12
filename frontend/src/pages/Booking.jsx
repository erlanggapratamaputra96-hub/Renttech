import { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { MapContainer, TileLayer, Marker, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import API from "../services/api";

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

function FlyTo({ location }) {
  const map = useMap();
  useEffect(() => {
    if (location) map.flyTo([location.lat, location.lng], 16);
  }, [location]);
  return null;
}

export default function Booking() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [form, setForm] = useState({ tanggal_mulai: "", tanggal_selesai: "" });
  const [location, setLocation] = useState(null);
  const [alamat, setAlamat] = useState("");
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [showSug, setShowSug] = useState(false);
  const [loading, setLoading] = useState(false);
  const [totalHarga, setTotalHarga] = useState(0);
  const debounceRef = useRef(null);
  const [showTerms, setShowTerms] = useState(false);

  const user_id = localStorage.getItem("token")
    ? JSON.parse(atob(localStorage.getItem("token").split(".")[1])).id
    : null;

  useEffect(() => {
    API.get(`/products/${id}`).then((res) => setProduct(res.data));
  }, [id]);

  useEffect(() => {
    if (form.tanggal_mulai && form.tanggal_selesai && product) {
      const days = Math.ceil((new Date(form.tanggal_selesai) - new Date(form.tanggal_mulai)) / (1000 * 60 * 60 * 24));
      if (days > 0) setTotalHarga(days * product.harga_sewa);
    }
  }, [form, product]);

  const handleQueryChange = (e) => {
    const val = e.target.value;
    setQuery(val);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (val.length < 3) { setSuggestions([]); return; }
    debounceRef.current = setTimeout(async () => {
      try {
        const res = await fetch(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(val)}&format=json&addressdetails=1&limit=5&countrycodes=id`);
        const data = await res.json();
        setSuggestions(data);
        setShowSug(true);
      } catch { setSuggestions([]); }
    }, 400);
  };

  const handleSelectSuggestion = (item) => {
    setLocation({ lat: parseFloat(item.lat), lng: parseFloat(item.lon) });
    setAlamat(item.display_name);
    setQuery(item.display_name);
    setSuggestions([]);
    setShowSug(false);
  };

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async () => {
    if (!form.tanggal_mulai || !form.tanggal_selesai || !location) {
      alert("Lengkapi semua data termasuk lokasi pickup!");
      return;
    }
    setLoading(true);
    try {
      const res = await API.post("/rentals", {
      user_id, product_id: id,
      tanggal_mulai: form.tanggal_mulai,
      tanggal_selesai: form.tanggal_selesai,
      latitude: location.lat,
      longitude: location.lng,
      alamat_pickup: alamat,
});
navigate(`/invoice/${res.data.id}`);
    } catch (err) {
      alert("Booking gagal: " + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  };

  const formatHarga = (h) => "Rp " + Number(h).toLocaleString("id-ID");

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=DM+Sans:wght@300;400;500&display=swap');
        * { margin: 0; padding: 0; box-sizing: border-box; }
        html, body, #root { height: 100%; width: 100%; }
        .bk-root { min-height: 100vh; background: #020b18; font-family: 'DM Sans', sans-serif; color: #fff; }
        .bk-nav { display: flex; align-items: center; justify-content: space-between; padding: 18px 48px; background: #040f1e; border-bottom: 1px solid #0d2440; }
        .bk-brand { font-family: 'Syne', sans-serif; font-size: 22px; font-weight: 800; cursor: pointer; }
        .bk-brand span { color: #0057ff; }
        .bk-back { padding: 8px 18px; background: transparent; border: 1px solid #0d2440; border-radius: 8px; color: #4a6380; font-size: 13px; cursor: pointer; font-family: 'DM Sans', sans-serif; transition: all 0.2s; }
        .bk-back:hover { border-color: #0057ff; color: #0099ff; }
        .bk-body { max-width: 1000px; margin: 0 auto; padding: 40px 24px; display: grid; grid-template-columns: 1fr 1fr; gap: 24px; }
        .bk-card { background: #040f1e; border: 1px solid #0d2440; border-radius: 14px; padding: 24px; }
        .bk-card h3 { font-family: 'Syne', sans-serif; font-size: 18px; font-weight: 700; margin-bottom: 20px; }
        .bk-product-img { width: 100%; height: 160px; background: #071525; border-radius: 10px; display: flex; align-items: center; justify-content: center; font-size: 56px; margin-bottom: 16px; }
        .bk-product-name { font-family: 'Syne', sans-serif; font-size: 20px; font-weight: 700; margin-bottom: 6px; }
        .bk-product-harga { color: #0099ff; font-size: 16px; font-weight: 500; margin-bottom: 8px; }
        .bk-product-desc { color: #4a6380; font-size: 13px; line-height: 1.5; }
        .bk-field { margin-bottom: 16px; }
        .bk-field label { display: block; font-size: 12px; text-transform: uppercase; letter-spacing: 1px; color: #4a6380; font-weight: 500; margin-bottom: 6px; }
        .bk-field input { width: 100%; padding: 12px 14px; background: #071525; border: 1px solid #0d2440; border-radius: 8px; color: #fff; font-size: 14px; font-family: 'DM Sans', sans-serif; outline: none; transition: all 0.2s; }
        .bk-field input:focus { border-color: #0057ff; box-shadow: 0 0 0 3px #0057ff18; }

        .bk-search-wrap { position: relative; margin-bottom: 16px; }
        .bk-search-input { width: 100%; padding: 12px 14px 12px 40px; background: #071525; border: 1px solid #0d2440; border-radius: 8px; color: #fff; font-size: 14px; font-family: 'DM Sans', sans-serif; outline: none; transition: all 0.2s; }
        .bk-search-input:focus { border-color: #0057ff; box-shadow: 0 0 0 3px #0057ff18; }
        .bk-search-icon { position: absolute; left: 14px; top: 50%; transform: translateY(-50%); font-size: 16px; }
        .bk-suggestions { position: absolute; top: 100%; left: 0; right: 0; background: #071525; border: 1px solid #0d2440; border-radius: 8px; z-index: 1000; max-height: 220px; overflow-y: auto; margin-top: 4px; }
        .bk-sug-item { padding: 12px 14px; cursor: pointer; font-size: 13px; color: #cdd6e0; border-bottom: 1px solid #0d2440; transition: background 0.15s; display: flex; gap: 10px; align-items: flex-start; }
        .bk-sug-item:last-child { border-bottom: none; }
        .bk-sug-item:hover { background: #0d2440; color: #fff; }
        .bk-sug-icon { color: #0057ff; flex-shrink: 0; margin-top: 2px; }
        .bk-sug-text { line-height: 1.4; }

        .bk-map-wrap { border-radius: 10px; overflow: hidden; border: 1px solid #0d2440; margin-bottom: 12px; }
        .leaflet-container { z-index: 1; }
        .bk-map-hint { font-size: 12px; color: #4a6380; margin-bottom: 8px; }
        .bk-total { background: #071525; border: 1px solid #0057ff30; border-radius: 10px; padding: 16px; margin-bottom: 16px; display: flex; justify-content: space-between; align-items: center; }
        .bk-total span { color: #4a6380; font-size: 14px; }
        .bk-total strong { font-family: 'Syne', sans-serif; font-size: 20px; color: #0099ff; }
        .bk-submit { width: 100%; padding: 14px; background: linear-gradient(135deg, #0057ff, #0099ff); color: #fff; border: none; border-radius: 10px; font-size: 15px; font-weight: 500; cursor: pointer; font-family: 'DM Sans', sans-serif; transition: all 0.2s; }
        .bk-submit:hover { transform: translateY(-1px); box-shadow: 0 8px 25px #0057ff40; }
        .bk-submit:disabled { opacity: 0.6; cursor: not-allowed; }
        @media (max-width: 768px) { .bk-body { grid-template-columns: 1fr; } }
      `}</style>

      <div className="bk-root">
        {showTerms && (
  <div style={{position:"fixed", inset:0, background:"#00000090", zIndex:300, display:"flex", alignItems:"center", justifyContent:"center", padding:20}}>
    <div style={{background:"#040f1e", border:"1px solid #0d2440", borderRadius:16, padding:32, maxWidth:480, maxHeight:"85vh", overflowY:"auto", position:"relative"}}>
      <div style={{position:"absolute", top:0, left:0, right:0, height:2, background:"linear-gradient(90deg, transparent, #0057ff, #00c6ff, transparent)", borderRadius:"16px 16px 0 0"}} />
      <h3 style={{fontFamily:"'Syne', sans-serif", fontSize:20, fontWeight:700, marginBottom:16, color:"#fff"}}>Syarat & Ketentuan Penyewaan</h3>
      <div style={{fontSize:13, color:"#cdd6e0", lineHeight:1.8, marginBottom:24}}>
        <p style={{marginBottom:10}}>1. Penyewa wajib mengembalikan barang sesuai tanggal selesai sewa yang telah ditentukan.</p>
        <p style={{marginBottom:10}}>2. Keterlambatan pengembalian akan dikenakan denda sebesar <strong style={{color:"#ffaa00"}}>Rp 250.000</strong> per hari keterlambatan.</p>
        <p style={{marginBottom:10}}>3. Barang yang dikembalikan dalam kondisi rusak atau hilang akan dikenakan denda sebesar <strong style={{color:"#ff6b6b"}}>Rp 1.000.000</strong>.</p>
        <p style={{marginBottom:10}}>4. Layanan penyewaan hanya berlaku untuk wilayah <strong style={{color:"#0099ff"}}>Jabodetabek</strong> (Jakarta, Bogor, Depok, Tangerang, Bekasi).</p>
        <p style={{marginBottom:10}}>5. Pembayaran wajib dilakukan dalam waktu 10 menit setelah booking, atau transaksi otomatis dibatalkan.</p>
        <p>6. Penyewa wajib menyediakan lokasi pickup yang valid dan dapat diakses oleh pihak RentTech.</p>
      </div>
      <div style={{display:"flex", gap:10}}>
        <button onClick={() => setShowTerms(false)} style={{flex:1, padding:12, background:"transparent", border:"1px solid #0d2440", borderRadius:8, color:"#4a6380", fontSize:14, cursor:"pointer", fontFamily:"'DM Sans', sans-serif"}}>Kembali</button>
        <button onClick={() => { setShowTerms(false); handleSubmit(); }} style={{flex:1, padding:12, background:"linear-gradient(135deg, #0057ff, #0099ff)", color:"#fff", border:"none", borderRadius:8, fontSize:14, fontWeight:500, cursor:"pointer", fontFamily:"'DM Sans', sans-serif"}}>Saya Setuju</button>
      </div>
    </div>
  </div>
)}
        <nav className="bk-nav">
          <div className="bk-brand" onClick={() => navigate("/dashboard")}>Rent<span>Tech</span></div>
          <button className="bk-back" onClick={() => navigate("/dashboard")}>← Kembali</button>
        </nav>

        <div className="bk-body">
          <div>
            <div className="bk-card">
              <h3>Detail Produk</h3>
              {product && <>
                <div className="bk-product-img">{product.category_id === 1 ? "📱" : "📷"}</div>
                <div className="bk-product-name">{product.nama_produk}</div>
                <div className="bk-product-harga">{formatHarga(product.harga_sewa)} / hari</div>
                <div className="bk-product-desc">{product.deskripsi}</div>
              </>}
            </div>
          </div>

          <div>
            <div className="bk-card" style={{ marginBottom: 24 }}>
              <h3>Tanggal Sewa</h3>
              <div className="bk-field">
                <label>Tanggal Mulai</label>
                <input type="date" name="tanggal_mulai" onChange={handleChange} min={new Date().toISOString().split("T")[0]} />
              </div>
              <div className="bk-field">
                <label>Tanggal Selesai</label>
                <input type="date" name="tanggal_selesai" onChange={handleChange} min={form.tanggal_mulai} />
              </div>
              {totalHarga > 0 && (
                <div className="bk-total">
                  <span>Total Pembayaran</span>
                  <strong>{formatHarga(totalHarga)}</strong>
                </div>
              )}
            </div>

            <div className="bk-card">
              <h3>Lokasi Pickup</h3>
              <p className="bk-map-hint">🔍 Ketik alamat untuk mencari lokasi penjemputan</p>
              <div className="bk-search-wrap">
                <span className="bk-search-icon">📍</span>
                <input
                  className="bk-search-input"
                  placeholder="Cari alamat, jalan, tempat..."
                  value={query}
                  onChange={handleQueryChange}
                  onFocus={() => suggestions.length > 0 && setShowSug(true)}
                />
                {showSug && suggestions.length > 0 && (
                  <div className="bk-suggestions">
                    {suggestions.map((item, i) => (
                      <div key={i} className="bk-sug-item" onClick={() => handleSelectSuggestion(item)}>
                        <span className="bk-sug-icon">📍</span>
                        <span className="bk-sug-text">{item.display_name}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="bk-map-wrap">
                <MapContainer center={[-6.2088, 106.8456]} zoom={12} style={{ height: 280, width: "100%" }}>
                  <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                  <FlyTo location={location} />
                  {location && <Marker position={[location.lat, location.lng]} />}
                </MapContainer>
              </div>

             <button className="bk-submit" onClick={() => {
                if (!form.tanggal_mulai || !form.tanggal_selesai || !location) {
                 alert("Lengkapi semua data termasuk lokasi pickup!");
                return;
                }
                setShowTerms(true);
                }} disabled={loading}>
               {loading ? "Memproses..." : "Konfirmasi Booking"}
             </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}