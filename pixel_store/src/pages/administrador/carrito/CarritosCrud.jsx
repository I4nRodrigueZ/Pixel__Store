import React, { useState, useEffect } from "react";
import { useNavigate } from 'react-router-dom';
import AOS from 'aos';
import 'aos/dist/aos.css';
import "../../administrador/admin.css";
import { Search } from 'lucide-react';

const CarritosCRUD = () => {
  const [carritos, setCarritos] = useState([]);
  const [filtro, setFiltro] = useState("");
  const [juegos, setJuegos] = useState([]); // Nuevo estado para almacenar juegos
  const navigate = useNavigate();

  useEffect(() => {
    AOS.init({ duration: 1000 });
    fetchCarritos();
    fetchJuegos(); // Llamar a la función para obtener juegos
  }, []);

  const fetchCarritos = async () => {
    try {
      const response = await fetch("https://pixel-store-nii6.onrender.com/carritos", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      const data = await response.json();
      if (response.ok) {
        setCarritos(data);
      } else {
        alert(data.mensaje || "Error al cargar los carritos.");
      }
    } catch (error) {
      console.error("Error al cargar carritos:", error);
    }
  };

  const fetchJuegos = async () => {
    try {
      const response = await fetch("https://pixel-store-nii6.onrender.com/juegos");
      const data = await response.json();
      if (response.ok) {
        setJuegos(data);
      }
    } catch (error) {
      console.error("Error al cargar juegos:", error);
    }
  };

  const handleGoToAdmin = () => {
    navigate("/administrador");
  };

  // Función para obtener el título del juego por ID
  const obtenerTituloJuego = (juegoId) => {
    const juego = juegos.find(j => j.id === juegoId);
    return juego ? juego.titulo : `Juego ID: ${juegoId}`;
  };

  const carritosFiltrados = carritos.filter((carrito) =>
    carrito.usuario?.toString().includes(filtro.toLowerCase()) ||
    carrito.id?.toString().includes(filtro.toLowerCase())
  );

  return (
    <div className="admin-container">
      <h1 data-aos="fade-down">Carritos Registrados</h1>

      <div className="search-bar" data-aos="fade-up">
        <Search size={20} style={{ position: 'absolute', margin: '10px', color: '#888' }} />
        <input
          type="text"
          className="input1"
          placeholder="Buscar por usuario o ID de carrito..."
          value={filtro}
          onChange={(e) => setFiltro(e.target.value)}
          style={{ paddingLeft: '30px' }}
        />
      </div>

      <div className="table-container" data-aos="fade-up">
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Usuario ID</th>
              <th>Total</th>
              <th>Juegos</th>
            </tr>
          </thead>
          <tbody>
            {carritosFiltrados.map((carrito) => (
              <tr key={carrito.id} data-aos="fade-left">
                <td>{carrito.id}</td>
                <td>{carrito.usuario}</td>
                <td>${carrito.total?.toFixed(2) || '0.00'}</td>
                <td>
                  {carrito.detalles?.length > 0 ? (
                    carrito.detalles.map((detalle, i) => (
                      <div key={i}>
                        {obtenerTituloJuego(detalle.juego_id)}
                      </div>
                    ))
                  ) : (
                    "-"
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <button
        className="boton1"
        onClick={handleGoToAdmin}
        style={{ marginTop: "20px", backgroundColor: "#9b59b6" }}
      >
        Volver al Administrador
      </button>
    </div>
  );
};

export default CarritosCRUD;