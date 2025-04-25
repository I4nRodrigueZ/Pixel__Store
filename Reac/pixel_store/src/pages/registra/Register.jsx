import React, { useState } from "react";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { useNavigate } from "react-router-dom"; // Importamos useNavigate

const Register = () => {
  const navigate = useNavigate(); // Hook para redireccionar

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

  const nameRegex = /^[a-zA-Z\s]*$/; // Solo letras y espacios
  const phoneRegex = /^[0-9]{0,10}$/; // Solo números, máximo 10 caracteres

  // Validación de mayúsculas y números en nombre, apellido y teléfono
  const handleChange = (e) => {
    const { name, value } = e.target;

    if ((name === "nombre" || name === "apellido") && !nameRegex.test(value)) {
      return; // Permite solo letras y espacios
    }

    // Transformar la primera letra de los campos nombre y apellido en mayúscula
    if (name === "nombre" || name === "apellido") {
      const capitalizedValue = value.replace(/\b\w/g, (char) => char.toUpperCase());
      setFormData({ ...formData, [name]: capitalizedValue });
      return;
    }

    if (name === "password" && value.length > 16) {
      return; // Limita la longitud a 16 caracteres
    }

    if (name === "telefono" && !phoneRegex.test(value)) {
      return; // Permite solo números y máximo 10 caracteres
    }

    setFormData({ ...formData, [name]: value });
  };

  const validatePassword = (password) => {
    const hasUpperCase = /[A-Z]/.test(password); // Contiene al menos una mayúscula
    const hasNumber = /\d/.test(password); // Contiene al menos un número
    return hasUpperCase && hasNumber;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.password.length > 16) {
      alert("La contraseña no puede tener más de 16 caracteres.");
      return;
    }

    if (!validatePassword(formData.password)) {
      alert("La contraseña debe contener al menos una letra mayúscula y un número.");
      return;
    }

    if (formData.telefono.length > 10) {
      alert("El número de teléfono no puede tener más de 10 caracteres.");
      return;
    }

    if (!formData.direccion) {
      alert("La dirección es obligatoria.");
      return;
    }

    try {
      const response = await fetch("http://localhost:5000/signin", {
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
        alert("Registro completo 💖. Ahora puedes iniciar sesión.");
        navigate("/login"); // Redirecciona al login
      } else {
        alert(data.mensaje || "Error al registrar usuario");
      }
    } catch (error) {
      console.error("Error al conectar con el servidor:", error);
      alert("Hubo un problema al conectar con el servidor.");
    }
  };

  return (
    <div className="login-container">
      <form className="form" onSubmit={handleSubmit}>
        <div className="form-title">
          <span>Register</span>
        </div>
        <div className="title-2">
          <span>GAMES</span>
        </div>
        <div className="input-container">
          <input
            required
            type="text"
            name="nombre"
            placeholder="Nombre"
            value={formData.nombre}
            onChange={handleChange}
            className="input-field"
          />
        </div>
        <div className="input-container">
          <input
            required
            type="text"
            name="apellido"
            placeholder="Apellido"
            value={formData.apellido}
            onChange={handleChange}
            className="input-field"
          />
        </div>
        <div className="input-container">
          <input
            required
            type="email"
            name="email"
            placeholder="Email"
            value={formData.email}
            onChange={handleChange}
            className="input-field"
          />
        </div>
        <div className="input-container password-container">
          <input
            required
            type={showPassword ? "text" : "password"}
            name="password"
            placeholder="Contraseña"
            value={formData.password}
            onChange={handleChange}
            className="input-field"
            maxLength={16}
          />
          <span
            className="password-toggle"
            onClick={() => setShowPassword(!showPassword)}
            style={{ cursor: "pointer", position: "absolute", right: "10px", top: "50%", transform: "translateY(-50%)" }}
          >
            {showPassword ? <FaEyeSlash /> : <FaEye />}
          </span>
        </div>
        <div className="input-container">
          <input
            type="text"
            name="telefono"
            placeholder="Teléfono"
            value={formData.telefono}
            onChange={handleChange}
            className="input-field"
            maxLength={10}
          />
        </div>
        <div className="input-container">
          <input
            required
            type="text"
            name="direccion"
            placeholder="Dirección"
            value={formData.direccion}
            onChange={handleChange}
            className="input-field"
          />
        </div>
        <button className="submit" type="submit">
          Registrar
        </button>
      </form>
    </div>
  );
};

export default Register;
