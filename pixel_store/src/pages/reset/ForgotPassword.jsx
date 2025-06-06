import React, { useState } from 'react';
import axios from 'axios';
import "./ForgotPassword.css";
const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [mensaje, setMensaje] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMensaje('');
    setError('');

    try {
      const response = await axios.post('https://pixel-store-nii6.onrender.com/forgot-password', { email });
      setMensaje(response.data.mensaje);
    } catch (err) {
      if (err.response && err.response.data && err.response.data.mensaje) {
        setError(err.response.data.mensaje);
      } else {
        setError('Ocurrió un error al enviar la solicitud.');
      }
    }
  };

  return (
    <div className="forgot-container">
      <div className="forgot-card">
        <h2>Recuperar contraseña</h2>
        <form onSubmit={handleSubmit}>
          <label htmlFor="email">Correo electrónico</label>
          <input
            type="email"
            id="email"
            placeholder="Ingresa tu correo"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <button type="submit">Enviar enlace</button>
        </form>

        {mensaje && <p className="mensaje-exito">{mensaje}</p>}
        {error && <p className="mensaje-error">{error}</p>}
      </div>
    </div>
  );
};

export default ForgotPassword;
