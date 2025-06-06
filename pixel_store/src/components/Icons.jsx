import React from 'react';
import { SiEpicgames, SiUbisoft } from 'react-icons/si';  // Ubisoft y Epic Games
import { FaSteam } from 'react-icons/fa';  // Steam
import { CiMenuBurger } from 'react-icons/ci';  // Nuevo icono de menú

const Icons = () => {
  return (
    <div className="icons">
      {/* Icono de Epic Games */}
      <a href="#" data-aos="fade-in" data-aos-duration="1400" data-aos-delay="600">
        <SiEpicgames size={40} className="icon-img" />
      </a>

      {/* Icono de Ubisoft */}
      <a href="#" data-aos="fade-in" data-aos-duration="1400" data-aos-delay="700">
        <SiUbisoft size={40} className="icon-img" />
      </a>

      {/* Icono de Steam */}
      <a href="#" data-aos="fade-in" data-aos-duration="1400" data-aos-delay="800">
        <FaSteam size={40} className="icon-img" />
      </a>

     
    </div>
  );
};

export default Icons;
