import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import AOS from "aos";
import "aos/dist/aos.css";
import "../catalogo/catalogo.css";
import logo from "../../assets/images/logo3.png"; // Logo por defecto

const SearchResults = () => {
  const [juegos, setJuegos] = useState([]);
  const [loading, setLoading] = useState(true);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    AOS.init(); // Inicializar animaciones AOS
  }, []);

  useEffect(() => {
    if (location.state && location.state.juegos) {
      setJuegos(location.state.juegos);
    } else {
      navigate("/"); // Si no hay datos, redirigir a la página principal
    }
    setLoading(false);
  }, [location.state, navigate]);

  if (loading) {
    return (
      <div className="loader-wrapper">
        <div className="packman"></div>
        <div className="dots">
          <div className="dot"></div>
          <div className="dot"></div>
          <div className="dot"></div>
          <div className="dot"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="catalogo-container">
      <h1 data-aos="fade-down" data-aos-duration="1000">🎯 Resultados de búsqueda</h1>

      <div className="juegos-lista">
        {juegos.length === 0 ? (
          <p>No se encontraron juegos.</p>
        ) : (
          juegos.map((juego) => (
            <div
              key={juego.id}
              className="juego-card"
              data-aos="fade-up"
              data-aos-duration="800"
            >
              <img
                className="juego-imagen"
                src={juego.imagen_url || logo}
                alt={juego.titulo}
                onError={(e) => { e.target.src = logo; }}
              />
              <h2>{juego.titulo}</h2>
              <p className="juego-descripcion">
                {juego.descripcion && juego.descripcion.length > 80
                  ? `${juego.descripcion.slice(0, 80)}...`
                  : juego.descripcion}
              </p>
              <p className="juego-precio">💰 Precio: ${juego.precio.toFixed(2)}</p>
              <p className="juego-stock">
                📦 Stock:{" "}
                <strong style={{ color: juego.stock < 5 ? "red" : "#27ae60" }}>
                  {juego.stock > 0 ? juego.stock : "Agotado"}
                </strong>
              </p>
              <p className="juego-condicion">
                🔹 Condición: <strong>{juego.condicion || "Desconocida"}</strong>
              </p>
              <p className="juego-categoria">
                🎯 Categoría:{" "}
                <strong>{juego.categoria?.nombre || "Sin categoría"}</strong>
              </p>
              <button
                className="boton-comprar"
                onClick={() => navigate(`/detalle/${juego.id}`)}
              >
                🛒 Comprar
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default SearchResults;
