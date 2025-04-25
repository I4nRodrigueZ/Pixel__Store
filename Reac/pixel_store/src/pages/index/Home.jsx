import React from 'react';
import Carousel from '../../components/Carousel';
import Card from '../../components/Card';
import Header from '../../components/Header';
import Encabezado from '../../components/Encabezado';
import video from '../../assets/images/Death Stranding 2_ On the Beach - Tráiler de reservas subtitulado en español  _ PlayStation España(1080P_HD).mp4';
import CategoriaSlider from '../../components/CategoriaSlider';
import fc25 from '../../assets/images/juegos/fc25.jpg'; 
import goku from '../../assets/images/juegos/goku.jpg'; 
import resize from '../../assets/images/juegos/resize.jpg';  
import black6 from '../../assets/images/juegos/black6.jpg';  

const Home = () => {
  const cardsData = [
    { id: 1, image: fc25 },
    { id: 2, image: goku },
    { id: 3, image: resize },
    { id: 4, image: black6 },
  ];

  return (
    <>
      <Header />

      {/* Hero Section con animaciones escalonadas */}
      <section className="hero" style={{ marginBottom: '100px' }}>
        <div className="hero-text">
          <h5 data-aos="fade-right" data-aos-duration="800">#Heart of Chornobyl</h5>
          <h1 data-aos="fade-right" data-aos-duration="800" data-aos-delay="200">Death Stranding 2</h1>
          <p data-aos="fade-right" data-aos-duration="800" data-aos-delay="300">
            Lanzamiento: 26 de junio de 2025 (exclusivo para PS5).
          </p>
          <div className="main-hero" data-aos="fade-up" data-aos-duration="800" data-aos-delay="400">
            <a href="#" className="btn">Order now</a>
            <a href="#" className="price">$80.99 | <span>Regular Price</span></a>
          </div>
        </div>
        <div className="hero-video" data-aos="fade-left" data-aos-duration="800" data-aos-delay="100">
          <video width="100%" controls autoPlay muted loop>
            <source src={video} type="video/mp4" />
            Tu navegador no soporta el formato de video.
          </video>
        </div>
      </section>

      {/* Sección de Carrusel Principal */}
      <Encabezado 
        titulo="Explora los mejores videojuegos para todas las plataformas" 
        data-aos="fade-up" 
        data-aos-duration="600"
      />
      
      <div data-aos="fade-up" data-aos-duration="800" data-aos-delay="200">
        <Carousel />
      </div>

      {/* Secciones de Categorías con animaciones consistentes */}
      <Encabezado 
        titulo="🎮 Acción" 
        data-aos="fade-up" 
        data-aos-duration="600"
      />
      <div data-aos="fade-up" data-aos-duration="800" data-aos-delay="100">
        <CategoriaSlider categoriaId={1} />
      </div>

      <Encabezado 
        titulo="🎮 Aventura" 
        data-aos="fade-up" 
        data-aos-duration="600"
      />
      <div data-aos="fade-up" data-aos-duration="800" data-aos-delay="100">
        <CategoriaSlider categoriaId={2} />
      </div>            

      <Encabezado 
        titulo="🎮 Deportes" 
        data-aos="fade-up" 
        data-aos-duration="600"
      />
      <div data-aos="fade-up" data-aos-duration="800" data-aos-delay="100">
        <CategoriaSlider categoriaId={3} />
      </div>

      {/* Tarjetas con animación escalonada */}
    </>
  );
};

export default Home;