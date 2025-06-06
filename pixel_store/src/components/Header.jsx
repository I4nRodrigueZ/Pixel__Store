import React, { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { CiMenuBurger } from "react-icons/ci";
import { FaUserCircle, FaShoppingCart } from "react-icons/fa";
import logo from "../assets/images/logo3.png";
import SearchBar from "./SearchBar";
import ProfileMenu from "./ProfileMenu";

const Header = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate(); // Corregido
  const isAuthenticated = !!localStorage.getItem("token");

  const handleMenuToggle = () => {
    setMenuOpen(!menuOpen);
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login"); // Corregido
  };

  const hideElements = location.pathname === "/login" || location.pathname.startsWith("/admin");

  const cartCount = 0;

  return (
    <header className="header-container">
      {/* Logo */}
      <Link to="/" className="logo">
        <img src={logo} alt="PIXEL STORE Logo" />
      </Link>

      {/* Menú de navegación */}
      <ul className={`navlist ${menuOpen ? "open" : ""}`}>
        <li>
          <Link to="/catalogo">Catálogo</Link>
        </li>
      </ul>

      {/* Acciones del header */}
      <div className="header-actions">
        {/* Barra de búsqueda */}
        {!hideElements && (
          <div className="search-container">
            <SearchBar />
          </div>
        )}

        {/* Carrito */}
        {!hideElements && (
          <div className="cart-icon">
            <Link to="/carrito">
              <FaShoppingCart />
              {cartCount > 0 && <span className="cart-count">{cartCount}</span>}
            </Link>
          </div>
        )}

        {/* Perfil o Login */}
        <div className="user-action">
          {isAuthenticated ? (
            <ProfileMenu onLogout={handleLogout} />
          ) : !hideElements ? (
            <Link to="/login" className="signin-btn">
              <FaUserCircle className="user-icon" />
              <span>Sign In</span>
            </Link>
          ) : null}
        </div>

        {/* Menú hamburguesa */}
        <div id="menu-icon" onClick={handleMenuToggle}>
          <CiMenuBurger />
        </div>
      </div>
    </header>
  );
};

export default Header;
