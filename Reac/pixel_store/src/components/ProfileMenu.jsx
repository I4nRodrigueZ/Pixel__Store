import { useState, useRef, useEffect } from "react";
import { FaUser } from "react-icons/fa";
import { Link } from "react-router-dom";
import "./ProfileMenu.css";

const ProfileMenu = ({ onLogout }) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);

  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setMenuOpen(false);
      }
    };

    if (menuOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [menuOpen]);

  // 🔎 Obtenemos el rol desde el localStorage
  const rol = localStorage.getItem("rol");

  // 🔀 Ruta del perfil según el rol
  let perfilRuta = "/login"; // fallback por si algo falla
  if (rol === "admin") perfilRuta = "/administrador";
  else if (rol === "usuario") perfilRuta = "/editar-perfil"; // Ruta para editar perfil de usuario
  else if (rol === "vendedor") perfilRuta = "/panel-vendedor"; // Ruta para panel vendedor

  return (
    <div className={`profile-menu ${menuOpen ? "active" : ""}`} ref={menuRef}>
      <button className="profile-button" onClick={toggleMenu}>
        <div className="avatar-wrapper">
          <FaUser className="profile-icon" />
          {/* Si tienes imagen real en el futuro, puedes usar esto:
          <img src="/ruta/avatar.jpg" alt="Avatar" className="avatar-img" />
          */}
        </div>
      </button>

      <div className="profile-dropdown">
        <Link to={perfilRuta}>Mi perfil</Link>
        <button onClick={onLogout}>Cerrar sesión</button>
      </div>
    </div>
  );
};

export default ProfileMenu;
