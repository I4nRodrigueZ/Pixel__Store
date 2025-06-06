import React, { useEffect, useState } from "react";
import AOS from "aos";
import "aos/dist/aos.css";
import "../../administrador/admin.css";
import { useNavigate } from "react-router-dom";

const PromocionesCRUD = () => {
  const [promociones, setPromociones] = useState([]);
  const [juegos, setJuegos] = useState([]);
  const [formData, setFormData] = useState({
    nombre: "",
    tipo_descuento: "Porcentaje",
    valor_descuento: "",
    fecha_inicio: "",
    fecha_fin: "",
    juego_id: "",
    esPromocionGlobal: true,
  });
  const [editingPromocionId, setEditingPromocionId] = useState(null);

  const navigate = useNavigate();

  useEffect(() => {
    AOS.init();
    fetchPromociones();
    fetchJuegos();
  }, []);

  const fetchPromociones = async () => {
    try {
      const response = await fetch("https://pixel-store-nii6.onrender.com/promociones", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      const data = await response.json();
      if (response.ok) {
        setPromociones(data);
      } else if (response.status === 401) {
        alert("No autorizado. Por favor inicia sesión.");
        navigate("/login");
      } else {
        alert(data.mensaje || "Error al cargar las promociones.");
      }
    } catch (error) {
      console.error("Error al cargar promociones:", error);
    }
  };

  const fetchJuegos = async () => {
    try {
      const response = await fetch("https://pixel-store-nii6.onrender.com/juegos", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      const data = await response.json();
      if (response.ok) {
        setJuegos(data);
      } else if (response.status === 401) {
        alert("No autorizado. Por favor inicia sesión.");
        navigate("/login");
      } else {
        alert(data.mensaje || "Error al cargar juegos.");
      }
    } catch (error) {
      console.error("Error al cargar juegos:", error);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const parsedValor = parseFloat(formData.valor_descuento);
    if (isNaN(parsedValor)) {
      alert("El valor del descuento debe ser un número válido.");
      return;
    }

    const payload = {
      nombre: formData.nombre,
      tipo_descuento: formData.tipo_descuento,
      valor_descuento: parsedValor,
      fecha_inicio: formData.fecha_inicio,
      fecha_fin: formData.fecha_fin,
      es_global: formData.esPromocionGlobal,
      juegos_ids: formData.esPromocionGlobal ? [] : [formData.juego_id]
    };

    const url = editingPromocionId
      ? `https://pixel-store-nii6.onrender.com/promocion/${editingPromocionId}`
      : "https://pixel-store-nii6.onrender.com/promociones";

    const method = editingPromocionId ? "PUT" : "POST";

    try {
      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (response.ok) {
        alert(editingPromocionId ? "Promoción actualizada" : "Promoción creada");
        resetForm();
        fetchPromociones();
      } else if (response.status === 401) {
        alert("No autorizado. Por favor inicia sesión.");
        navigate("/login");
      } else {
        alert(data.mensaje || "Error al guardar la promoción.");
      }
    } catch (error) {
      console.error("Error al guardar promoción:", error);
    }
  };

  const handleEdit = (promocion) => {
    setEditingPromocionId(promocion.id);
    setFormData({
      nombre: promocion.nombre,
      tipo_descuento: promocion.tipo_descuento,
      valor_descuento: promocion.valor_descuento,
      fecha_inicio: promocion.fecha_inicio,
      fecha_fin: promocion.fecha_fin,
      juego_id: promocion.juegos && promocion.juegos.length > 0 ? promocion.juegos[0].id : "",
      esPromocionGlobal: promocion.es_global,
    });
  };

  const handleDelete = async (id) => {
    if (window.confirm("¿Estás seguro de eliminar esta promoción?")) {
      try {
        const response = await fetch(`https://pixel-store-nii6.onrender.com/promocion/${id}`, {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });

        if (response.ok) {
          alert("Promoción eliminada");
          fetchPromociones();
        } else if (response.status === 401) {
          alert("No autorizado. Por favor inicia sesión.");
          navigate("/login");
        } else {
          alert("Error al eliminar promoción.");
        }
      } catch (error) {
        console.error("Error al eliminar promoción:", error);
      }
    }
  };

  const resetForm = () => {
    setFormData({
      nombre: "",
      tipo_descuento: "Porcentaje",
      valor_descuento: "",
      fecha_inicio: "",
      fecha_fin: "",
      juego_id: "",
      esPromocionGlobal: true,
    });
    setEditingPromocionId(null);
  };

  const formatValorDescuento = (tipo, valor) => {
    return tipo === 'Porcentaje' ? `${valor}%` : `$${parseFloat(valor).toFixed(2)}`;
  };

  const getNombreJuego = (promo) => {
    if (promo.es_global) return "Global";
    
    if (promo.juegos && promo.juegos.length > 0) {
      return promo.juegos[0].titulo;
    }
    
    return "Sin juego asignado";
  };

  return (
    <div>
      <h1 data-aos="fade-down" data-aos-duration="1000">Gestión de Promociones</h1>

      <form onSubmit={handleSubmit} data-aos="fade-up" data-aos-duration="1500" data-aos-delay="200">
        <input
          className="input1"
          type="text"
          name="nombre"
          placeholder="Nombre de la promoción"
          value={formData.nombre}
          onChange={handleChange}
          required
        />
        
        <select
          className="input1"
          name="tipo_descuento"
          value={formData.tipo_descuento}
          onChange={handleChange}
        >
          <option value="Porcentaje">Porcentaje</option>
          <option value="Monto_Fijo">Monto Fijo</option>
        </select>
        
        <input
          className="input1"
          type="number"
          name="valor_descuento"
          placeholder="Valor del descuento"
          value={formData.valor_descuento}
          onChange={handleChange}
          step="0.01"
          min="0"
          required
        />
        
        <div className="fecha-container">
          <div className="fecha-input">
            <label>Fecha de inicio:</label>
            <input
              className="input1"
              type="date"
              name="fecha_inicio"
              value={formData.fecha_inicio}
              onChange={handleChange}
              required
            />
          </div>
          
          <div className="fecha-input">
            <label>Fecha de fin:</label>
            <input
              className="input1"
              type="date"
              name="fecha_fin"
              value={formData.fecha_fin}
              onChange={handleChange}
              required
            />
          </div>
        </div>

        <div className="checkbox-container">
          <label>
            <input
              type="checkbox"
              checked={formData.esPromocionGlobal}
              onChange={() => setFormData(prev => ({ ...prev, esPromocionGlobal: !prev.esPromocionGlobal }))}
            />
            Promoción global (Aplica a todos los juegos)
          </label>
        </div>

        {!formData.esPromocionGlobal && (
          <div className="juego-select-container">
            <label>Juego específico:</label>
            <select
              className="input1"
              name="juego_id"
              value={formData.juego_id}
              onChange={handleChange}
              required
            >
              <option value="">Selecciona un juego</option>
              {juegos.map((juego) => (
                <option key={juego.id} value={juego.id}>
                  {juego.titulo}
                </option>
              ))}
            </select>
          </div>
        )}

        <div className="form-buttons">
          <button className="boton1" type="submit" data-aos="zoom-in" data-aos-duration="1000">
            {editingPromocionId ? "Actualizar Promoción" : "Crear Promoción"}
          </button>
          {editingPromocionId && (
            <button className="boton-cancelar" type="button" onClick={resetForm}>
              Cancelar Edición
            </button>
          )}
        </div>
      </form>

      <div className="table-container" data-aos="fade-up" data-aos-duration="1500">
        <table>
          <thead>
            <tr>
              <th>Nombre</th>
              <th>Tipo</th>
              <th>Valor</th>
              <th>Inicio</th>
              <th>Fin</th>
              <th>Ámbito</th>
              <th>Juego Asociado</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {promociones.length > 0 ? (
              promociones.map((promo) => (
                <tr key={promo.id} data-aos="fade-left" data-aos-duration="1000">
                  <td>{promo.nombre}</td>
                  <td>{promo.tipo_descuento}</td>
                  <td>{formatValorDescuento(promo.tipo_descuento, promo.valor_descuento)}</td>
                  <td>{new Date(promo.fecha_inicio).toLocaleDateString()}</td>
                  <td>{new Date(promo.fecha_fin).toLocaleDateString()}</td>
                  <td>{promo.es_global ? "Global" : "Específica"}</td>
                  <td>{getNombreJuego(promo)}</td>
                  <td className="acciones-cell">
                    <button
                      className="boton-editar"
                      onClick={() => handleEdit(promo)}
                      data-aos="flip-left"
                      data-aos-duration="800"
                    >
                      Editar
                    </button>
                    <button
                      className="boton-eliminar"
                      onClick={() => handleDelete(promo.id)}
                      data-aos="flip-right"
                      data-aos-duration="800"
                    >
                      Eliminar
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="8" className="no-data">
                  No hay promociones registradas
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <button 
        className="boton-volver" 
        onClick={() => navigate("/administrador")} 
        data-aos="zoom-in" 
        data-aos-duration="1000"
      >
        Volver al Administrador
      </button>
    </div>
  );
};

export default PromocionesCRUD;