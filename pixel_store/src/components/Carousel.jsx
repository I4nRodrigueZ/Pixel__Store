import React from 'react';
import Slider from 'react-slick';
import '../assets/styles/style.css'; // Asegúrate de importar tus estilos
import { Link } from 'react-router-dom';
// Importa las imágenes directamente
import fc25 from '../assets/images/juegos/fc25.jpg';
import goku from '../assets/images/juegos/goku.jpg';
import resize from '../assets/images/juegos/resize.jpg';
import black6 from '../assets/images/juegos/black6.jpg';
import redDead from '../assets/images/juegos/red_dead.jpg';
import dead from '../assets/images/juegos/maxresdefault.jpg';
const Carousel = () => {
  const settings = {
    dots: true,
    infinite: true,
    speed: 800, // Aumenté la velocidad para mejor fluidez
    slidesToShow: 1,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 5000,
    fade: true, // Efecto fade entre slides
    arrows: true,
    responsive: [
      {
        breakpoint: 1024,
        settings: {
          slidesToShow: 1,
          slidesToScroll: 1,
          fade: false
        },
      },
      {
        breakpoint: 768,
        settings: {
          slidesToShow: 1,
          slidesToScroll: 1,
          fade: false
        },
      }
    ],
  };

  const slidesData = [
    {
      image: fc25,
      title: "EA SPORTS FC 25",
      subtitle: "El juego de fútbol definitivo",
      price: "$59.99",
      badge: "Nuevo Lanzamiento"
    },
    {
      image: goku,
      title: "Dragon Ball Z: Kakarot",
      subtitle: "Revive la saga de Goku",
      price: "$49.99",
      badge: "20% OFF"
    },
    {
      image: resize,
      title: "Red Dead Redemption 2",
      subtitle: "El western más aclamado",
      price: "$54.99",
      badge: "Más Vendido"
    },
    {
      image: black6,
      title: "Call of Duty: Black Ops 6",
      subtitle: "La guerra fría continúa",
      price: "$69.99",
      badge: "Pre-orden"
    },
    {
      image: dead,
        title: "Death Stranding 2",
        subtitle: "El regreso de Sam Porter Bridges",
        price: "$59.99",
        badge: "Preventa exclusiva"
      }
  ];

  return (
    <div className="carousel-container" style={{ position: 'relative' }}>
      <Slider {...settings}>
        {slidesData.map((slide, index) => (
          <div key={index} className="carousel-item">
            <div className="slide-image-container">
              <img 
                src={slide.image} 
                alt={slide.title} 
                className="slide-image"
              />
              <div className="slide-overlay"></div>
            </div>
            <div className="slide-content">
              {slide.badge && (
                <span className="slide-badge">{slide.badge}</span>
              )}
              <h3 className="slide-title">{slide.title}</h3>
              <p className="slide-subtitle">{slide.subtitle}</p>
              <div className="slide-price">{slide.price}</div>
              <Link to="/catalogo">
  <button className="slide-button">Ver Catalogo</button>
</Link>
            </div>
          </div>
        ))}
      </Slider>
    </div>
  );
};

export default Carousel;
