import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import "./ForgotPassword.css";
export default function ResetPasswordPage() {
  const { token } = useParams();
  const navigate = useNavigate();
  const [contrasena, setContrasena] = useState('');
  const [confirmar, setConfirmar] = useState('');
  const [mensaje, setMensaje] = useState('');
  const [error, setError] = useState(false);
  const [exito, setExito] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (contrasena !== confirmar) {
      setError(true);
      setMensaje('Las contraseñas no coinciden.');
      return;
    }

    try {
      const response = await axios.post(`https://pixel-store-nii6.onrender.com/reset-password/${token}`, {
        contrasena,
      });
      setExito(true);
      setMensaje(response.data.mensaje);
      setTimeout(() => navigate('/login'), 3000);
    } catch (err) {
      setError(true);
      setMensaje(err.response?.data?.mensaje || 'Ocurrió un error.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-black via-zinc-900 to-neutral-800 text-white p-4">
      <div className="w-full max-w-md bg-zinc-950 p-6 rounded-2xl shadow-xl border border-zinc-800">
        <h1 className="text-3xl font-bold mb-4 text-center text-amber-400">🔐 Restablecer Contraseña</h1>

        {mensaje && (
          <div className={`mb-4 p-3 rounded-md text-sm font-medium ${error ? 'bg-red-600' : 'bg-green-600'}`}>{mensaje}</div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <input
            type="password"
            placeholder="Nueva contraseña"
            className="px-4 py-2 rounded-md bg-zinc-800 border border-zinc-700 text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
            value={contrasena}
            onChange={(e) => setContrasena(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Confirmar contraseña"
            className="px-4 py-2 rounded-md bg-zinc-800 border border-zinc-700 text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
            value={confirmar}
            onChange={(e) => setConfirmar(e.target.value)}
            required
          />
          <button
            type="submit"
            className="bg-amber-500 hover:bg-amber-600 text-black font-bold py-2 rounded-md transition-all duration-300"
          >
            Restablecer
          </button>
        </form>
      </div>
    </div>
  );
}
