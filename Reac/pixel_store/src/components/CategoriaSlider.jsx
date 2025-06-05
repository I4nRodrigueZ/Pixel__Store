import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronLeft, ChevronRight } from "lucide-react"; // usa íconos bonitos
import "./categoriaSlider.css";
import logo from "../assets/images/logo3.png";

const CategoriaSlider = ({ titulo, categoriaId }) => {
  const [juegos, setJuegos] = useState([]);
  const navigate = useNavigate();
  const sliderRef = useRef(null);

  useEffect(() => {
    fetch(`https://pixel-store-nii6.onrender.com/juegos?category_id=${categoriaId}`)
      .then((res) => res.json())
      .then((data) => setJuegos(data))
      .catch((err) => console.error("Error cargando juegos:", err));
  }, [categoriaId]);

  const scroll = (dir) => {
    const slider = sliderRef.current;
    if (slider) {
      const scrollAmount = 300;
      slider.scrollBy({
        left: dir === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth",
      });
    }
  };

  return (
    <div className="categoria-slider">
      <h2 className="categoria-titulo">{titulo}</h2>
      <div className="slider-wrapper">
        <button className="slider-btn left" onClick={() => scroll("left")}>
          <ChevronLeft size={24} />
        </button>
        <div className="slider-horizontal" ref={sliderRef}>
          {juegos.map((juego) => (
            <div
              key={juego.id}
              className="juego-card-slider"
              onClick={() => navigate(`/detalle/${juego.id}`)}
            >
              <img
                src={juego.imagen_url || logo}
                alt={juego.titulo}
                className="juego-img"
                onError={(e) => (e.target.src = logo)}
              />
              <div className="info-container">
                <p className="juego-titulo">{juego.titulo}</p>
                <p className="juego-precio">${juego.precio?.toFixed(2)}</p>
              </div>
            </div>
          ))}
        </div>
        <button className="slider-btn right" onClick={() => scroll("right")}>
          <ChevronRight size={24} />
        </button>
      </div>
    </div>
  );
};

export default CategoriaSlider;
