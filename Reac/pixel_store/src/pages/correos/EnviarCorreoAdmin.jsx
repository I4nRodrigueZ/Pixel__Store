import React, { useEffect, useState } from "react";
import AOS from "aos";
import "aos/dist/aos.css";
import "./CorreoAdmin.css";

const EnviarCorreoAdmin = () => {
  const [modo, setModo] = useState("individual");
  const [correoData, setCorreoData] = useState({
    destinatario: "",
    asunto: "",
    mensaje: "",
  });
  const [estado, setEstado] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    AOS.init({ duration: 800 });
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setCorreoData({ ...correoData, [name]: value });
  };

  const handleModoChange = (e) => {
    const nuevoModo = e.target.value;
    setModo(nuevoModo);
    setCorreoData({
      destinatario: "",
      asunto: "",
      mensaje: "",
    });
    setEstado("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const token = localStorage.getItem("token");
      const url =
        modo === "todos"
          ? "http://localhost:5000/admin/notificar-todos"
          : "http://localhost:5000/admin/notificar";

      const dataToSend =
        modo === "todos"
          ? {
              asunto: correoData.asunto,
              mensaje: correoData.mensaje,
            }
          : correoData;

      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(dataToSend),
      });

      const data = await response.json();
      if (response.ok) {
        setEstado("✅ Correo enviado exitosamente.");
        // Aquí podrías reproducir un sonido tipo "swoosh" pixelado:
        // new Audio("/sfx/swoosh.mp3").play();
        setCorreoData({
          destinatario: "",
          asunto: "",
          mensaje: "",
        });
      } else {
        setEstado(`❌ Error: ${data.error || "No se pudo enviar el correo"}`);
      }
    } catch (error) {
      console.error("Error enviando el correo:", error);
      setEstado("❌ Error de conexión con el servidor.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="correo-admin-container" data-aos="fade-up">
      <h2>✉️ Enviar correo {modo === "todos" ? "a todos los usuarios" : "individual"}</h2>

      <div className="modo-envio-selector">
        <label>📤 Modo de envío:</label>
        <select value={modo} onChange={handleModoChange}>
          <option value="individual">Individual</option>
          <option value="todos">Todos los usuarios</option>
        </select>
      </div>

      <form onSubmit={handleSubmit} className="correo-form">
        {modo === "individual" && (
          <input
            type="email"
            name="destinatario"
            placeholder="Correo del destinatario"
            value={correoData.destinatario}
            onChange={handleChange}
            required
            data-aos="zoom-in"
          />
        )}

        <input
          type="text"
          name="asunto"
          placeholder="Asunto"
          value={correoData.asunto}
          onChange={handleChange}
          required
          data-aos="zoom-in"
        />

        <textarea
          name="mensaje"
          placeholder="Mensaje"
          value={correoData.mensaje}
          onChange={handleChange}
          rows="6"
          required
          data-aos="zoom-in"
        />

        <button type="submit" disabled={isLoading}>
          {isLoading
            ? <span className="spinner"></span>
            : modo === "todos"
            ? "📢 Enviar a todos"
            : "📧 Enviar correo"}
        </button>
      </form>

      {estado && <p className="estado-envio">{estado}</p>}
    </div>
  );
};

export default EnviarCorreoAdmin;
