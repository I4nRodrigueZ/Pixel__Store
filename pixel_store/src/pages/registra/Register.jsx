import React, { useState } from "react";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

const Register = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    nombre: "",
    apellido: "",
    email: "",
    password: "",
    telefono: "",
    direccion: "",
    rol: "usuario",
  });

  const [showPassword, setShowPassword] = useState(false);

  const [showAchievement, setShowAchievement] = useState(false);
  const [achievementMessage, setAchievementMessage] = useState("");

  const showAchievementModal = (message) => {
    setAchievementMessage(message);
    setShowAchievement(true);
    setTimeout(() => setShowAchievement(false), 3500);
  };

  const nameRegex = /^[a-zA-Z\s]*$/;
  const phoneRegex = /^[0-9]{0,10}$/;

  const handleChange = (e) => {
    const { name, value } = e.target;

    if ((name === "nombre" || name === "apellido") && !nameRegex.test(value)) return;

    if (name === "nombre" || name === "apellido") {
      const capitalizedValue = value.replace(/\b\w/g, (char) => char.toUpperCase());
      setFormData({ ...formData, [name]: capitalizedValue });
      return;
    }

    if (name === "password" && value.length > 16) return;

    if (name === "telefono" && !phoneRegex.test(value)) return;

    setFormData({ ...formData, [name]: value });
  };

  const validatePassword = (password) => {
    const hasUpperCase = /[A-Z]/.test(password);
    const hasNumber = /\d/.test(password);
    return hasUpperCase && hasNumber;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.password.length > 16) {
      showAchievementModal("La contraseña no puede tener más de 16 caracteres.");
      return;
    }

    if (!validatePassword(formData.password)) {
      showAchievementModal("La contraseña debe contener al menos una mayúscula y un número.");
      return;
    }

    if (formData.telefono.length > 10) {
      showAchievementModal("El número de teléfono no puede tener más de 10 caracteres.");
      return;
    }

    if (!formData.direccion) {
      showAchievementModal("La dirección es obligatoria.");
      return;
    }

    try {
      const response = await fetch("https://pixel-store-nii6.onrender.com/signin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nombre: formData.nombre,
          apellido: formData.apellido,
          email: formData.email,
          contrasena: formData.password,
          telefono: formData.telefono,
          direccion: formData.direccion,
          rol: formData.rol,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        showAchievementModal("¡Registro exitoso! 💖 Redirigiendo...");
        setTimeout(() => navigate("/login"), 3500);
      } else {
        showAchievementModal(data.mensaje || "Error al registrar usuario 🚫");
      }
    } catch (error) {
      console.error("Error al conectar con el servidor:", error);
      showAchievementModal("Hubo un problema al conectar con el servidor 🤖");
    }
  };

  return (
    <div className="login-container">
      <form className="form" onSubmit={handleSubmit}>
        <div className="form-title"><span>Register</span></div>
        <div className="title-2"><span>GAMES</span></div>

        <div className="input-container">
          <input required type="text" name="nombre" placeholder="Nombre" value={formData.nombre} onChange={handleChange} className="input-field" />
        </div>
        <div className="input-container">
          <input required type="text" name="apellido" placeholder="Apellido" value={formData.apellido} onChange={handleChange} className="input-field" />
        </div>
        <div className="input-container">
          <input required type="email" name="email" placeholder="Email" value={formData.email} onChange={handleChange} className="input-field" />
        </div>
        <div className="input-container password-container">
          <input required type={showPassword ? "text" : "password"} name="password" placeholder="Contraseña" value={formData.password} onChange={handleChange} className="input-field" />
          <span className="toggle-password" onClick={() => setShowPassword(!showPassword)}>
            {showPassword ? <FaEyeSlash /> : <FaEye />}
          </span>
        </div>
        <div className="input-container">
          <input required type="text" name="telefono" placeholder="Teléfono" value={formData.telefono} onChange={handleChange} className="input-field" />
        </div>
        <div className="input-container">
          <input required type="text" name="direccion" placeholder="Dirección" value={formData.direccion} onChange={handleChange} className="input-field" />
        </div>

        <button className="submit" type="submit">
          <span className="sign-text">Sign up</span>
        </button>
      </form>

      {/* Alerta tipo logro */}
      {showAchievement && (
        <div className="achievement">
          <div className="achievement-content">
            <div className="icon-trophy">🏆</div>
            <div className="message">{achievementMessage}</div>
          </div>
        </div>
      )}

      {/* Meteoritos opcionales */}
      <div className="meteor"></div>
      <div className="meteor"></div>
      <div className="meteor"></div>

      {/* CSS interno para alerta */}
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

export default Register;
