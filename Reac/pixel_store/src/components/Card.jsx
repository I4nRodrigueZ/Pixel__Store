// src/components/Card.jsx
import React, { useState } from 'react';
import '../assets/styles/style.css'; // Asegúrate de que este archivo CSS exista

const Card = ({ image, secondImage }) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div 
      className="card"
      onMouseEnter={() => setIsHovered(true)} 
      onMouseLeave={() => setIsHovered(false)}
    >
      <img 
        src={isHovered ? secondImage : image} 
        alt="Imagen de tarjeta" 
        className="card-image" 
      />
    </div>
  );
};

export default Card;