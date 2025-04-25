import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import "./Login.css";

const Login = () => {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch("http://localhost:5000/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: formData.email,
          contrasena: formData.password,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        alert("Inicio de sesión exitoso");
        
        // 🪪 Guardar datos importantes en localStorage
        localStorage.setItem("token", data.token);
        localStorage.setItem("rol", data.rol); // 💾 Guardar rol
        localStorage.setItem("id_carrito", data.id_carrito);
        localStorage.setItem("id_usuario", data.id_usuario); // 💾 Guardar id_usuario

        // 🔀 Redirección según el rol
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
      } else {
        alert(data.mensaje || "Error en el inicio de sesión");
      }
    } catch (error) {
      console.error("Error al conectar con el servidor:", error);
      alert("Hubo un problema al conectar con el servidor.");
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

      {/* Meteoritos para que sea bien cósmico 🚀 */}
      <div className="meteor"></div>
      <div className="meteor"></div>
      <div className="meteor"></div>
    </div>
  );
};

export default Login;
