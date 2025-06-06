import React from "react";
import { useNavigate } from "react-router-dom";
import './InfoPage.css';

const InfoPage = () => {
  const navigate = useNavigate();

  return (
    <div className="info-container">
      {/* Título principal */}
      <h1>Bienvenido a Pixel Store 🎮</h1>

      {/* Sección sobre Pixel Store */}
      <section className="section">
        <h2>¿Quiénes somos?</h2>
        <p>
          En <span className="text-[#ae8957] font-semibold">Pixel Store</span> somos una tienda digital dedicada a la venta de videojuegos para todas las plataformas. Nuestra misión es brindarte acceso rápido, seguro y económico a tus juegos favoritos, sin complicaciones. 🚀
        </p>
      </section>

      {/* Manual de compra */}
      <section className="section">
        <h2>🛒 ¿Cómo comprar en Pixel Store?</h2>
        <ol>
          <li>Explora los juegos desde nuestra página principal.</li>
          <li>Haz clic en el juego que te interese para ver detalles.</li>
          <li>Presiona el botón <strong>"Agregar al carrito"</strong>.</li>
          <li>Dirígete al carrito y verifica tus productos.</li>
          <li>Haz clic en <strong>"Finalizar compra"</strong> e ingresa tus datos.</li>
          <li>Recibe tu juego digital por correo electrónico. 📧</li>
        </ol>
      </section>

{/* Info para vendedores */}
<section className="section">
  <h2>🛍️ ¿Cómo ser vendedor en Pixel Store?</h2>
  <p>
    ¿Quieres vender tus juegos o productos digitales en <strong>Pixel Store</strong>? ¡Es muy fácil! Solo sigue estos pasos:
  </p>
  <ul>
    <li>Primero, asegúrate de <strong>estar registrado e iniciar sesión</strong> como usuario en nuestra plataforma.</li>
    <li>
      Luego, envíanos al correo <strong className="red">dguerragomez4@gmail.com</strong> la siguiente información:
      <ul>
        <li>Nombre completo</li>
        <li>Apellido</li>
        <li>Número de contacto</li>
        <li>Dirección</li>
        <li>Correo electrónico</li>
      </ul>
    </li>
  </ul>
  <p>
    Nuestro equipo revisará tu solicitud y en un <strong>plazo de 2 a 3 días hábiles</strong> recibirás una respuesta con los siguientes pasos para convertirte en vendedor oficial de Pixel Store.
  </p>
  <p>
    <strong className="red">Importante:</strong> una vez seas aceptado como vendedor, 
    <strong> cualquier solicitud de cambio de contraseña, nombre, correo u otros datos personales</strong> deberá ser enviada directamente al correo <strong className="red">dguerragomez4@gmail.com</strong>, donde validaremos tu identidad y procesaremos el cambio con seguridad.
  </p>
  <p> Para realizar cualquier cambio, debes comunicarte vía correo a: <br />
    <strong className="red">dguerragomez4@gmail.com</strong>
  </p>
</section>

      {/* Botón para volver */}
      <div className="text-center mt-10">
        <button
          className="return-button"
          onClick={() => navigate("/")}
        >
          ⬅️ Volver al inicio
        </button>
      </div>
    </div>
  );
};

export default InfoPage;
