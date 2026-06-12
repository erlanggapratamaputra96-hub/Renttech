import { useState } from "react";
import API from "../services/api";
import { useNavigate, Link } from "react-router-dom";

export default function Register() {
  const [form, setForm] = useState({ nama: "", email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await API.post("/auth/register", form);
      navigate("/login");
    } catch (err) {
      setError(err.response?.data?.message || "Register gagal");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=DM+Sans:wght@300;400;500&display=swap');

        * { margin: 0; padding: 0; box-sizing: border-box; }

        html, body, #root {
          height: 100% !important;
          width: 100% !important;
          margin: 0 !important;
          padding: 0 !important;
        }

        .reg-root {
          min-height: 100vh;
          display: flex;
          font-family: 'DM Sans', sans-serif;
          background: #020b18;
          overflow: hidden;
        }

        .reg-left {
          flex: 1;
          position: relative;
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          text-align: center;
          padding: 60px;
          overflow: hidden;
          }

        .reg-left::before {
          content: '';
          position: absolute;
          inset: 0;
          background: radial-gradient(ellipse at 30% 50%, #0057ff22 0%, transparent 70%),
                      radial-gradient(ellipse at 80% 20%, #00c6ff18 0%, transparent 60%);
        }

        .reg-orb {
          position: absolute;
          border-radius: 50%;
          filter: blur(60px);
          animation: regFloat 8s ease-in-out infinite;
        }

        .reg-orb-1 {
          width: 400px; height: 400px;
          background: radial-gradient(circle, #0057ff30, transparent 70%);
          top: -100px; left: -100px;
        }

        .reg-orb-2 {
          width: 300px; height: 300px;
          background: radial-gradient(circle, #00c6ff25, transparent 70%);
          bottom: 50px; left: 200px;
          animation-delay: 3s;
        }

        @keyframes regFloat {
          0%, 100% { transform: translateY(0px) scale(1); }
          50% { transform: translateY(-30px) scale(1.05); }
        }

        .reg-brand {
          position: relative;
          z-index: 1;
          margin-bottom: 60px;
        }

        .reg-brand-name {
          font-family: 'Syne', sans-serif;
          font-size: 28px;
          font-weight: 800;
          color: #fff;
          letter-spacing: -0.5px;
        }

        .reg-brand-dot { color: #0057ff; }

        .reg-hero {
          position: relative;
          z-index: 1;
        }

        .reg-hero h1 {
          font-family: 'Syne', sans-serif;
          font-size: 52px;
          font-weight: 800;
          color: #fff;
          line-height: 1.1;
          letter-spacing: -2px;
          margin-bottom: 20px;
        }

        .reg-hero h1 span {
          background: linear-gradient(135deg, #0057ff, #00c6ff);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .reg-hero p {
          font-size: 16px;
          color: #6b8aad;
          line-height: 1.7;
          max-width: 360px;
          font-weight: 300;
          margin: 0 auto;
          }

        .reg-features {
          position: relative;
          z-index: 1;
          margin-top: 60px;
          display: flex;
          flex-direction: column;
          gap: 16px;
          align-items: flex-start;
          }

        .reg-feature-item {
          display: flex;
          align-items: center;
          gap: 12px;
          color: #4a6380;
          font-size: 14px;
        }

        .reg-feature-icon {
          width: 32px;
          height: 32px;
          background: #071525;
          border: 1px solid #0d2440;
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 14px;
          flex-shrink: 0;
        }

        .reg-right {
          width: 480px;
          background: #040f1e;
          border-left: 1px solid #0d2440;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 60px 50px;
          position: relative;
        }

        .reg-right::before {
          content: '';
          position: absolute;
          top: 0; left: 0; right: 0;
          height: 2px;
          background: linear-gradient(90deg, transparent, #0057ff, #00c6ff, transparent);
        }

        .reg-form-box { width: 100%; }

        .reg-form-box h2 {
          font-family: 'Syne', sans-serif;
          font-size: 30px;
          font-weight: 700;
          color: #fff;
          margin-bottom: 8px;
          letter-spacing: -1px;
        }

        .reg-form-box .reg-subtitle {
          font-size: 14px;
          color: #4a6380;
          margin-bottom: 36px;
          font-weight: 300;
        }

        .reg-field { margin-bottom: 18px; }

        .reg-field label {
          display: block;
          font-size: 12px;
          font-weight: 500;
          color: #4a6380;
          text-transform: uppercase;
          letter-spacing: 1px;
          margin-bottom: 8px;
        }

        .reg-field input {
          width: 100%;
          padding: 14px 18px;
          background: #071525;
          border: 1px solid #0d2440;
          border-radius: 10px;
          color: #fff;
          font-size: 15px;
          font-family: 'DM Sans', sans-serif;
          transition: all 0.2s;
          outline: none;
        }

        .reg-field input::placeholder { color: #1e3a55; }

        .reg-field input:focus {
          border-color: #0057ff;
          background: #071d35;
          box-shadow: 0 0 0 3px #0057ff18;
        }

        .reg-error {
          background: #1a0a0a;
          border: 1px solid #ff3b3b40;
          color: #ff6b6b;
          padding: 12px 16px;
          border-radius: 8px;
          font-size: 13px;
          margin-bottom: 18px;
        }

        .reg-btn {
          width: 100%;
          padding: 15px;
          background: linear-gradient(135deg, #0057ff, #0099ff);
          color: #fff;
          border: none;
          border-radius: 10px;
          font-size: 15px;
          font-weight: 500;
          font-family: 'DM Sans', sans-serif;
          cursor: pointer;
          transition: all 0.2s;
          margin-top: 8px;
          letter-spacing: 0.3px;
        }

        .reg-btn:hover { transform: translateY(-1px); box-shadow: 0 8px 25px #0057ff40; }
        .reg-btn:active { transform: translateY(0); }
        .reg-btn:disabled { opacity: 0.6; cursor: not-allowed; }

        .reg-login-link {
          text-align: center;
          margin-top: 28px;
          font-size: 14px;
          color: #4a6380;
        }

        .reg-login-link a {
          color: #0099ff;
          text-decoration: none;
          font-weight: 500;
        }

        .reg-login-link a:hover { color: #00c6ff; }

        @media (max-width: 900px) {
          .reg-left { display: none; }
          .reg-right { width: 100%; border-left: none; }
        }
      `}</style>

      <div className="reg-root">
        <div className="reg-left">
          <div className="reg-orb reg-orb-1" />
          <div className="reg-orb reg-orb-2" />

          <div className="reg-brand">
            <span className="reg-brand-name">Rent<span className="reg-brand-dot">Tech</span></span>
          </div>

          <div className="reg-hero">
            <h1>Mulai<br /><span>perjalanan</span><br />kamu.</h1>
            <p>Daftar sekarang dan nikmati kemudahan sewa perangkat teknologi kapan saja, di mana saja.</p>
          </div>

          <div className="reg-features">
            <div className="reg-feature-item">
              <div className="reg-feature-icon">⚡</div>
              Proses pendaftaran cepat & mudah
            </div>
            <div className="reg-feature-item">
              <div className="reg-feature-icon">🔒</div>
              Data kamu aman & terenkripsi
            </div>
          </div>
        </div>

        <div className="reg-right">
          <div className="reg-form-box">
            <h2>Buat akun baru</h2>
            <p className="reg-subtitle">Bergabung dengan RentTech sekarang</p>

            {error && <div className="reg-error">{error}</div>}

            <div className="reg-field">
              <label>Nama Lengkap</label>
              <input name="nama" placeholder="John Doe" onChange={handleChange} />
            </div>

            <div className="reg-field">
              <label>Email</label>
              <input name="email" type="email" placeholder="nama@email.com" onChange={handleChange} />
            </div>

            <div className="reg-field">
              <label>Password</label>
              <input name="password" type="password" placeholder="••••••••" onChange={handleChange} />
            </div>

            <button className="reg-btn" onClick={handleSubmit} disabled={loading}>
              {loading ? "Memproses..." : "Daftar Sekarang"}
            </button>

            <p className="reg-login-link">
              Sudah punya akun? <Link to="/login">Masuk di sini</Link>
            </p>
          </div>
        </div>
      </div>
    </>
  );
}