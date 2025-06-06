import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import "./ForgotPassword.css";

export default function ResetPasswordPage() {
  const { token } = useParams();
  const navigate = useNavigate();
  const [contrasena, setContrasena] = useState('');
  const [confirmar, setConfirmar] = useState('');
  
  // Estados para la alerta estilo logro
  const [showAchievement, setShowAchievement] = useState(false);
  const [achievementMessage, setAchievementMessage] = useState('');
  const [error, setError] = useState(false);

  const showAchievementModal = (message, isError = false) => {
    setAchievementMessage(message);
    setShowAchievement(true);
    setError(isError);
    setTimeout(() => setShowAchievement(false), 3500);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (contrasena !== confirmar) {
      showAchievementModal("Las contraseñas no coinciden 🚫", true);
      return;
    }

    try {
      const response = await axios.post(`https://pixel-store-nii6.onrender.com/reset-password/${token}`, {
        contrasena,
      });
      
      showAchievementModal("¡Contraseña cambiada con éxito! 💖 Redirigiendo...");
      setTimeout(() => navigate('/login'), 3500);
    } catch (err) {
      showAchievementModal(err.response?.data?.mensaje || 'Ocurrió un error 🚫', true);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-black via-zinc-900 to-neutral-800 text-white p-4">
      <div className="w-full max-w-md bg-zinc-950 p-6 rounded-2xl shadow-xl border border-zinc-800">
        <h1 className="text-3xl font-bold mb-4 text-center text-amber-400">🔐 Restablecer Contraseña</h1>

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

        {/* Alerta tipo logro */}
        {showAchievement && (
          <div className="achievement" style={{ borderColor: error ? '#ff4444' : '#d4af37' }}>
            <div className="achievement-content">
              <div className="icon-trophy">{error ? '❌' : '🏆'}</div>
              <div className="message">{achievementMessage}</div>
            </div>
          </div>
        )}

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
            color: ${error ? '#ff4444' : '#ffd700'};
            text-shadow: 0 0 5px ${error ? '#ff4444' : '#ffd700'};
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
    </div>
  );
}