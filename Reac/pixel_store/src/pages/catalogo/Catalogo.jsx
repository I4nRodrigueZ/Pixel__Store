import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import AOS from "aos";
import "aos/dist/aos.css";
import "./catalogo.css";
import logo from "../../assets/images/logo3.png"; // Logo por defecto

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
      const response = await fetch("http://localhost:5000/juegos");
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
      <h1 data-aos="fade-down" data-aos-duration="1000">
        🎮 Catálogo de Juegos
      </h1>

      <div className="juegos-lista">
        {juegos.length === 0 ? (
          <p>No hay juegos disponibles en este momento.</p>
        ) : (
          juegos.map((juego) => {
            console.log("Imagen URL:", juego.imagen_url); // Debug

            return (
              <div
                key={juego.id}
                className="juego-card"
                data-aos="fade-up"
                data-aos-duration="800"
              >
                <img
                  className="juego-imagen"
                  src={juego.imagen_url || logo} // Usa la URL de la imagen
                  alt={juego.titulo}
                  onError={(e) => { e.target.src = logo; }} // Si falla, usa el logo
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
                  <strong
                    style={{
                      color: juego.stock < 5 ? "red" : "#27ae60",
                    }}
                  >
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
            );
          })
        )}
      </div>
    </div>
  );
};

export default CatalogoJuegos;
