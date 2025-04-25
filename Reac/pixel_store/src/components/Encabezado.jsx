import React from 'react';
import '../assets/styles/style.css';

const Encabezado = ({ titulo }) => {
  return (
    <div
      className="encabezado-container"
      data-aos="fade-left"
      data-aos-duration="1400"
      data-aos-delay="200"
    >
      <h2 className="encabezado-titulo">{titulo}</h2>
      <span className="encabezado-linea"></span>
    </div>
  );
};

export default Encabezado;
