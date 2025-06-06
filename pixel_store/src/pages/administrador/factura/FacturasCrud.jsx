import React, { useState, useEffect } from "react";
import { useNavigate } from 'react-router-dom';
import AOS from 'aos';
import 'aos/dist/aos.css';
import "../../administrador/admin.css";
import { Search } from 'lucide-react';

const FacturasCRUD = () => {
  const [facturas, setFacturas] = useState([]);
  const [filtro, setFiltro] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    AOS.init({ duration: 1000 });
    fetchFacturas();
  }, []);

  const fetchFacturas = async () => {
    try {
      const response = await fetch("https://pixel-store-nii6.onrender.com/facturas", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      const data = await response.json();
      if (response.ok) {
        setFacturas(data);
      } else {
        alert(data.mensaje || "Error al cargar las facturas.");
      }
    } catch (error) {
      console.error("Error al cargar facturas:", error);
    }
  };

  const handleDelete = async (id) => {
    try {
      const response = await fetch(`https://pixel-store-nii6.onrender.com/factura/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      if (response.ok) {
        alert("Factura eliminada correctamente");
        fetchFacturas();
      } else {
        const errorData = await response.json();
        alert(errorData.mensaje || "Error al eliminar la factura.");
      }
    } catch (error) {
      console.error("Error al eliminar factura:", error);
    }
  };

  const handleGoToAdmin = () => {
    navigate("/administrador");
  };

  const facturasFiltradas = facturas.filter((factura) =>
    factura.usuario_id?.toString().includes(filtro.toLowerCase()) ||
    factura.metodo_pago?.toLowerCase().includes(filtro.toLowerCase())
  );

  return (
    <div className="admin-container">
      <h1 data-aos="fade-down">Facturas Registradas</h1>

      <div className="search-bar" data-aos="fade-up">
        <Search size={20} style={{ position: 'absolute', margin: '10px', color: '#888' }} />
        <input
          type="text"
          className="input1"
          placeholder="Buscar por usuario o método de pago..."
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
              <th>Usuario</th>
              <th>Divisa</th>
              <th>Fecha</th>
              <th>Método de Pago</th>
              <th>Subtotal</th>
              <th>Impuestos</th>
              <th>Total</th>
              <th>Detalles</th>
              <th>Eliminar</th>
            </tr>
          </thead>
          <tbody>
            {facturasFiltradas.map((factura) => (
              <tr key={factura.id} data-aos="fade-left">
                <td>{factura.id}</td>
                <td>{factura.usuario_id}</td>
                <td>{factura.divisa ?? "-"}</td>
                <td>{new Date(factura.fecha).toLocaleString()}</td>
                <td>{factura.metodo_pago}</td>
                <td>${factura.monto_subtotal?.toFixed(2)}</td>
                <td>${factura.impuestos?.toFixed(2)}</td>
                <td>${factura.total?.toFixed(2)}</td>
                <td>
                  {factura.detalles?.length > 0 ? (
                    factura.detalles.map((detalle, i) => (
                      <div key={i}>
                        <strong>{detalle.juego?.titulo}</strong> x{detalle.cantidad} = ${detalle.subtotal?.toFixed(2)}
                      </div>
                    ))
                  ) : (
                    <em>Sin detalles</em>
                  )}
                </td>
                <td>
                  <button
                    className="boton-eliminar"
                    onClick={() => handleDelete(factura.id)}
                    data-aos="flip-right"
                  >
                    Eliminar
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <button
        className="boton1"
        onClick={handleGoToAdmin}
        style={{ marginTop: "20px", backgroundColor: "#3498db" }}
      >
        Volver al Administrador
      </button>
    </div>
  );
};

export default FacturasCRUD;
