import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import "./login.css";

const Login = () => {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [showAchievement, setShowAchievement] = useState(false);
  const [achievementMessage, setAchievementMessage] = useState("");
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const showAchievementModal = (message) => {
    setAchievementMessage(message);
    setShowAchievement(true);
    setTimeout(() => setShowAchievement(false), 3500);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch("https://pixel-store-nii6.onrender.com/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: formData.email,
          contrasena: formData.password,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        showAchievementModal("¡Inicio de sesión exitoso! 🎮");

        localStorage.setItem("token", data.token);
        localStorage.setItem("rol", data.rol);
        localStorage.setItem("id_carrito", data.id_carrito);
        localStorage.setItem("id_usuario", data.id_usuario);

        setTimeout(() => {
          switch (data.rol) {
            case "admin":
              navigate("/administrador");
              break;
            case "usuario":
              navigate("/catalogo");
              break;
            case "vendedor":
              navigate("/vendedor");
              break;
            default:
              navigate("/");
              break;
          }
        }, 3500);
      } else {
        showAchievementModal(data.mensaje || "Error en el inicio de sesión 🚫");
      }
    } catch (error) {
      console.error("Error al conectar con el servidor:", error);
      showAchievementModal("Problema al conectar con el servidor 🤖");
    }
  };

  return (
    <div className="background">
      <div className="login-container">
        <form className="form" onSubmit={handleSubmit}>
          <div className="form-title">
            <span>sign in to your</span>
          </div>
          <div className="title-2">
            <span>GAMES</span>
          </div>

          <div className="input-container">
            <input
              required
              className="input-name"
              type="email"
              name="email"
              placeholder="Email"
              value={formData.email}
              onChange={handleChange}
            />
          </div>

          <div className="input-container">
            <input
              required
              className="input-pwd"
              type="password"
              name="password"
              placeholder="Password"
              value={formData.password}
              onChange={handleChange}
            />
          </div>

          <button className="submit" type="submit">
            <span className="sign-text">Sign in</span>
          </button>

          <p className="forgot-link">
            <Link to="/forgot-password">¿Olvidaste tu contraseña?</Link>
          </p>

          <p className="signup-link">
            No account? <Link className="up" to="/register">Sign up!</Link>
          </p>
        </form>
      </div>

      {/* Logro flotante arriba */}
      {showAchievement && (
        <div className="achievement">
          <div className="achievement-content">
            <div className="icon-trophy">🏆</div>
            <div className="message">{achievementMessage}</div>
          </div>
        </div>
      )}

      {/* Meteoritos cósmicos */}
      <div className="meteor"></div>
      <div className="meteor"></div>
      <div className="meteor"></div>

      {/* CSS interno para el logro */}
      <style>{`
        .achievement {
          position: fixed;
          top: 20px;
          left: 50%;
          transform: translateX(-50%);
          background: rgba(0, 0, 0, 0.8);
          border: 2px solid #d4af37;
          color: #f7f1e1;
          padding: 20px 40px;
          border-radius: 15px;
          box-shadow: 0 8px 25px rgba(0,0,0,0.6);
          z-index: 9999;
          display: flex;
          align-items: center;
          font-family: 'Press Start 2P', cursive;
          font-size: 14px;
          animation: slide-down 0.5s ease-out, fade-out 0.5s 3s forwards;
        }

        .achievement-content {
          display: flex;
          align-items: center;
          gap: 15px;
        }

        .icon-trophy {
          font-size: 28px;
          color: #ffd700;
          text-shadow: 0 0 5px #ffd700;
        }

        .message {
          max-width: 400px;
          line-height: 1.4;
        }

        @keyframes slide-down {
          0% {
            transform: translateX(-50%) translateY(-60px);
            opacity: 0;
          }
          100% {
            transform: translateX(-50%) translateY(0);
            opacity: 1;
          }
        }

        @keyframes fade-out {
          to {
            opacity: 0;
            transform: translateX(-50%) translateY(-60px);
          }
        }
      `}</style>
    </div>
  );
};

export default Login;
