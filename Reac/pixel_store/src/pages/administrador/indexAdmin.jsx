import React, { useState, useEffect } from 'react';
import './indexadmin.css';
import { Link } from 'react-router-dom';
import AOS from 'aos';
import 'aos/dist/aos.css';

const IndexAdmin = () => {
  const [time, setTime] = useState(new Date());
  const [userName, setUserName] = useState('Administrador');

  useEffect(() => {
    const timer = setInterval(() => {
      setTime(new Date());
    }, 1000);

    AOS.init(); // Inicializamos AOS

    return () => clearInterval(timer);
  }, []);

  const formatDate = (date) => {
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    const seconds = date.getSeconds().toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year} ${hours}:${minutes}:${seconds}`;
  };

  return (
    <div className="indexadmin-container">
      <div className="header" data-aos="fade-down" data-aos-duration="1500">
        <h1>Bienvenido, {userName}!</h1>
        <p className="current-date" data-aos="fade-up" data-aos-duration="1500">
          {formatDate(time)}
        </p>
      </div>

      <div className="crud-buttons">
        <Link to="/administrador/usuarios" className="crud-btn" data-aos="fade-up" data-aos-duration="1000">
          CRUD Usuarios
        </Link>
        <Link to="/administrador/categorias" className="crud-btn" data-aos="fade-up" data-aos-duration="1000">
          CRUD Categorías
        </Link>
        <Link to="/administrador/juegos" className="crud-btn" data-aos="fade-up" data-aos-duration="1000">
          CRUD Juegos
        </Link>
        <Link to="/administrador/divisa" className="crud-btn" data-aos="fade-up" data-aos-duration="1000">
          CRUD Divisas
        </Link>
        <Link to="/administrador/resenas" className="crud-btn" data-aos="fade-up" data-aos-duration="1000">
          CRUD Reseñas
        </Link>
        <Link to="/administrador/factura" className="crud-btn" data-aos="fade-up" data-aos-duration="1000">
          Crud Facturas
        </Link>
        <Link to="/administrador/carrito" className="crud-btn" data-aos="fade-up" data-aos-duration="1000">
          Crud Carritos
        </Link>
        <Link to="/administrador/enviar-correos" className="crud-btn" data-aos="fade-up" data-aos-duration="1000">
          Enviar Correos
        </Link>
        <Link to="/administrador/promociones" className="crud-btn" data-aos="fade-up" data-aos-duration="1000">
          Promociones
        </Link>
      </div>
    </div>
  );
};

export default IndexAdmin;
