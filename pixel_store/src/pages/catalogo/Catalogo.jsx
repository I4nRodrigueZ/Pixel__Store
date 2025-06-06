import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import AOS from "aos";
import "aos/dist/aos.css";
import "./catalogo.css";
import logo from "../../assets/images/logo3.png";

const CatalogoJuegos = () => {
  const [juegos, setJuegos] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    AOS.init();
    fetchJuegos();
  }, []);

  const fetchJuegos = async () => {
    try {
      const response = await fetch("https://pixel-store-nii6.onrender.com/juegos");
      const data = await response.json();
      if (response.ok) {
        setJuegos(data);
      } else {
        alert(data.mensaje || "Error al cargar los juegos.");
      }
    } catch (error) {
      console.error("Error al cargar juegos:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="ghost-loader-container">
        <div id="ghost">
          <div id="red">
            <div id="pupil"></div>
            <div id="pupil1"></div>
            <div id="eye"></div>
            <div id="eye1"></div>
            <div id="top0"></div>
            <div id="top1"></div>
            <div id="top2"></div>
            <div id="top3"></div>
            <div id="top4"></div>
            <div id="st0"></div>
            <div id="st1"></div>
            <div id="st2"></div>
            <div id="st3"></div>
            <div id="st4"></div>
            <div id="st5"></div>
            <div id="an1"></div>
            <div id="an2"></div>
            <div id="an3"></div>
            <div id="an4"></div>
            <div id="an5"></div>
            <div id="an6"></div>
            <div id="an7"></div>
            <div id="an8"></div>
            <div id="an9"></div>
            <div id="an10"></div>
            <div id="an11"></div>
            <div id="an12"></div>
            <div id="an13"></div>
            <div id="an14"></div>
            <div id="an15"></div>
            <div id="an16"></div>
            <div id="an17"></div>
            <div id="an18"></div>
          </div>
          <div id="shadow"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="catalogo-container">
      <h1 data-aos="fade-down" data-aos-duration="1000">
        🎮 Catálogo de Juegos
      </h1>

      <div className="juegos-lista">
        {juegos.length === 0 ? (
          <p>No hay juegos disponibles en este momento.</p>
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
                {juego.descripcion.length > 80
                  ? `${juego.descripcion.slice(0, 80)}...`
                  : juego.descripcion}
              </p>
              <p className="juego-precio">💰 Precio: ${juego.precio}</p>
              <p className="juego-stock">
                📦 Stock: {" "}
                <strong style={{ color: juego.stock < 5 ? "red" : "#27ae60" }}>
                  {juego.stock}
                </strong>
              </p>
              <p className="juego-condicion">🔹 Condición: {juego.condicion}</p>
              <p className="juego-categoria">
                🎯 Categoría: {" "}
                <strong>
                  {juego.categoria ? juego.categoria.nombre : "Sin categoría"}
                </strong>
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

export default CatalogoJuegos;