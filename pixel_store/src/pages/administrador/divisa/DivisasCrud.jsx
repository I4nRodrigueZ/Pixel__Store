import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import AOS from "aos";
import "aos/dist/aos.css";
import "../../administrador/admin.css";
import { FaEdit, FaTrash, FaPlus, FaSearch, FaSync } from "react-icons/fa";

const Divisas = () => {
  const [divisas, setDivisas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [editMode, setEditMode] = useState(false);
  const [currentDivisa, setCurrentDivisa] = useState({
    id: null,
    nombre: "",
    simbolo: "",
    tipo_cambio: 0, // Cambié tasa_cambio por tipo_cambio
  });
  const navigate = useNavigate();

  useEffect(() => {
    AOS.init();
    fetchDivisas();
  }, []);

  const fetchDivisas = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch("https://pixel-store-nii6.onrender.com/divisas", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        if (response.status === 401) {
          navigate("/login");
          return;
        }
        throw new Error("Error al cargar las divisas");
      }

      const data = await response.json();
      setDivisas(data);
    } catch (error) {
      console.error("Error:", error);
      alert(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  const filteredDivisas = divisas.filter(
    (divisa) =>
      divisa.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      divisa.simbolo.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setCurrentDivisa({
      ...currentDivisa,
      [name]: name === "tipo_cambio" ? parseFloat(value) : value, // Cambié tasa_cambio por tipo_cambio
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("token");

    try {
      let response;
      if (editMode) {
        // Actualizar divisa existente
        response = await fetch(`https://pixel-store-nii6.onrender.com/divisa/${currentDivisa.id}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(currentDivisa),
        });
      } else {
        // Crear nueva divisa
        response = await fetch("https://pixel-store-nii6.onrender.com/divisas", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(currentDivisa),
        });
      }

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.mensaje || "Error al procesar la solicitud");
      }

      const data = await response.json();

      if (editMode) {
        setDivisas(
          divisas.map((divisa) =>
            divisa.id === currentDivisa.id ? data : divisa
          )
        );
      } else {
        setDivisas([...divisas, data]);
      }

      resetForm();
      fetchDivisas(); // Recargar datos para asegurar consistencia
    } catch (error) {
      console.error("Error:", error);
      alert(error.message);
    }
  };

  const handleEdit = (divisa) => {
    setEditMode(true);
    setCurrentDivisa({
      id: divisa.id,
      nombre: divisa.nombre,
      simbolo: divisa.simbolo,
      tipo_cambio: divisa.tipo_cambio, // Cambié tasa_cambio por tipo_cambio
    });
  };

  const handleDelete = async (id) => {
    if (!window.confirm("¿Estás seguro de que deseas eliminar esta divisa?")) {
      return;
    }

    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`https://pixel-store-nii6.onrender.com/divisa/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Error al eliminar la divisa");
      }

      setDivisas(divisas.filter((divisa) => divisa.id !== id));
      alert("Divisa eliminada exitosamente");
    } catch (error) {
      console.error("Error:", error);
      alert(error.message);
    }
  };

  const resetForm = () => {
    setEditMode(false);
    setCurrentDivisa({
      id: null,
      nombre: "",
      simbolo: "",
      tipo_cambio: 0, // Cambié tasa_cambio por tipo_cambio
    });
  };

  if (loading) {
    return (
      <div className="loader-wrapper">
        <div className="packman"></div>
        <div className="dots">
          <div className="dot"></div>
          <div className="dot"></div>
          <div className="dot"></div>
          <div className="dot"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="divisas-container">
      <h1 data-aos="fade-down" data-aos-duration="1000">
        💱 Gestión de Divisas
      </h1>

      <div className="divisas-actions">
        <div className="search-bar">
          <FaSearch className="search-icon" />
          <input
            type="text"
            placeholder="Buscar divisas..."
            value={searchTerm}
            onChange={handleSearch}
          />
        </div>

        <button
          className="refresh-button"
          onClick={fetchDivisas}
          title="Actualizar lista"
        >
          <FaSync /> Actualizar
        </button>
      </div>

      <div className="divisas-form-container">
        <h2>{editMode ? "Editar Divisa" : "Agregar Nueva Divisa"}</h2>
        <form onSubmit={handleSubmit} className="divisas-form">
          <div className="form-group">
            <label>Nombre:</label>
            <input
              type="text"
              name="nombre"
              value={currentDivisa.nombre}
              onChange={handleInputChange}
              required
              placeholder="Ej: Dólar estadounidense"
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Símbolo:</label>
              <input
                type="text"
                name="simbolo"
                value={currentDivisa.simbolo}
                onChange={handleInputChange}
                required
                placeholder="Ej: USD"
                maxLength="5"
              />
            </div>

            <div className="form-group">
              <label>Tipo de Cambio:</label>
              <input
                type="number"
                name="tipo_cambio" // Cambié tasa_cambio por tipo_cambio
                value={currentDivisa.tipo_cambio}
                onChange={handleInputChange}
                required
                step="0.0001"
                min="0"
                placeholder="Ej: 1.0000"
              />
            </div>
          </div>

          <div className="form-buttons">
            <button type="submit" className="submit-button">
              {editMode ? "Actualizar" : "Agregar"}
            </button>
            {editMode && (
              <button
                type="button"
                onClick={resetForm}
                className="cancel-button"
              >
                Cancelar
              </button>
            )}
          </div>
        </form>
      </div>

      <div className="divisas-list-container">
        <h2>Listado de Divisas</h2>
        {filteredDivisas.length === 0 ? (
          <p>No se encontraron divisas.</p>
        ) : (
          <table className="divisas-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Nombre</th>
                <th>Símbolo</th>
                <th>Tipo de Cambio</th> {/* Cambié Tasa de Cambio a Tipo de Cambio */}
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filteredDivisas.map((divisa) => (
                <tr key={divisa.id}>
                  <td>{divisa.id}</td>
                  <td>{divisa.nombre}</td>
                  <td>{divisa.simbolo}</td>
                  <td>
                    {divisa.tipo_cambio !== undefined && divisa.tipo_cambio !== null
                      ? divisa.tipo_cambio.toFixed(4) // Cambié tasa_cambio por tipo_cambio
                      : "N/A"}
                  </td>
                  <td className="actions-cell">
                    <button
                      onClick={() => handleEdit(divisa)}
                      className="edit-button"
                      title="Editar"
                    >
                      <FaEdit />
                    </button>
                    <button
                      onClick={() => handleDelete(divisa.id)}
                      className="delete-button"
                      title="Eliminar"
                    >
                      <FaTrash />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default Divisas;
