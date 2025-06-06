import React from 'react';
import './Footer.css';
import { useNavigate } from 'react-router-dom';
import { FaFacebookF, FaTwitter, FaInstagram, FaDiscord, FaGooglePlay, FaAppStoreIos } from 'react-icons/fa';

const Footer = () => {
  const navigate = useNavigate();

  return (
    <footer className="footer">
      <div className="footer-container">

        <div className="footer-section">
          <h3>Sobre Pixel Store</h3>
          <ul>
            <li onClick={() => navigate('/sobre')}>Sobre nosotros</li>
            <li onClick={() => navigate('/atencion')}>¿Necesitas ayuda?</li>
          </ul>
        </div>

        <div className="footer-section">
          <h3>Comprar</h3>
          <ul>
            <li onClick={() => navigate('/catalogo')}>Categorías</li>
            <li onClick={() => navigate('/sobre')}>Cómo comprar</li>
          </ul>
        </div>

        <div className="footer-section poem">
          <p>
            "Los videojuegos son un reflejo de nuestra búsqueda<br />
            de significado en un mundo simulado,<br />
            donde la realidad es una ilusión<br />
            y la libertad es un código."<br />
            <span>— Diego el perrón</span>
          </p>
        </div>

        <div className="footer-section">
          <h3>Síguenos</h3>
          <div className="social-icons">
            <FaFacebookF />
            <FaTwitter />
            <FaInstagram />
            <FaDiscord />
          </div>
        </div>

        <div className="footer-section">
          <h3>Registrarse</h3>
          <p>Únete a la comunidad de jugadores.</p>
          <button className="register-button" onClick={() => navigate('/register')}>Registrarse</button>
        </div>

      </div>

      <div className="footer-bottom">
        <div className="stores">
          <FaGooglePlay />
          <FaAppStoreIos />
        </div>
        <p>© 2025 Pixel Store - Todos los derechos reservados.</p>
      </div>
    </footer>
  );
};

export default Footer;
