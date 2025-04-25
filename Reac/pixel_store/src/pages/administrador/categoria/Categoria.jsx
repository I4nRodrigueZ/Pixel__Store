import React, { useState, useEffect } from "react";
import AOS from "aos";
import "aos/dist/aos.css";
import "../../administrador/admin.css";
import { useNavigate } from "react-router-dom"; // Importa useNavigate

const CategoriasCRUD = () => {
  const [categorias, setCategorias] = useState([]);
  const [formData, setFormData] = useState({
    nombre: "",
  });
  const [editingCategoryId, setEditingCategoryId] = useState(null);

  const navigate = useNavigate(); // Crea el hook navigate

  // Obtener categorías
  const fetchCategorias = async () => {
    try {
      const response = await fetch("http://localhost:5000/categorias", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      const data = await response.json();
      if (response.ok) {
        setCategorias(data);
      } else if (response.status === 401) {
        alert("No autorizado. Por favor inicia sesión.");
      } else {
        alert(data.mensaje || "Error al cargar las categorías.");
      }
    } catch (error) {
      console.error("Error al cargar categorías:", error);
    }
  };

  // Manejar cambios en el formulario
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  // Manejar envío del formulario
  const handleSubmit = async (e) => {
    e.preventDefault();

    const url = editingCategoryId
      ? `http://localhost:5000/categoria/${editingCategoryId}`
      : "http://localhost:5000/categorias";
    const method = editingCategoryId ? "PUT" : "POST";

    try {
      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify(formData),
      });
      const data = await response.json();
      if (response.ok) {
        alert(editingCategoryId ? "Categoría actualizada" : "Categoría creada");
        fetchCategorias();
        setFormData({ nombre: "" });
        setEditingCategoryId(null);
      } else if (response.status === 401) {
        alert("No autorizado. Por favor inicia sesión.");
      } else {
        alert(data.mensaje || "Error al guardar la categoría.");
      }
    } catch (error) {
      console.error("Error al guardar categoría:", error);
    }
  };

  // Manejar edición de una categoría
  const handleEdit = (categoria) => {
    setEditingCategoryId(categoria.id);
    setFormData({ nombre: categoria.nombre });
  };

  // Manejar eliminación de una categoría
  const handleDelete = async (id) => {
    try {
      const response = await fetch(`http://localhost:5000/categoria/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      if (response.ok) {
        alert("Categoría eliminada");
        fetchCategorias();
      } else if (response.status === 401) {
        alert("No autorizado. Por favor inicia sesión.");
      } else {
        alert("Error al eliminar la categoría.");
      }
    } catch (error) {
      console.error("Error al eliminar categoría:", error);
    }
  };

  // Inicializar AOS y cargar categorías
  useEffect(() => {
    AOS.init();
    fetchCategorias();
  }, []);

  return (
    <div>
      <h1 data-aos="fade-down" data-aos-duration="1000">Gestión de Categorías</h1>

      <form onSubmit={handleSubmit} data-aos="fade-up" data-aos-duration="1500" data-aos-delay="200">
        <input
          className="input1"
          type="text"
          name="nombre"
          placeholder="Nombre de la categoría"
          value={formData.nombre}
          onChange={handleChange}
          required
        />
        <button className="boton1" type="submit" data-aos="zoom-in" data-aos-duration="1000">
          {editingCategoryId ? "Actualizar" : "Agregar"}
        </button>
      </form>

      <div className="table-container" data-aos="fade-up" data-aos-duration="1500">
        <table>
          <thead>
            <tr>
              <th>Nombre</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {categorias.map((categoria) => (
              <tr key={categoria.id} data-aos="fade-left" data-aos-duration="1000">
                <td>{categoria.nombre}</td>
                <td>
                  <button
                    className="boton-editar"
                    onClick={() => handleEdit(categoria)}
                    data-aos="flip-left"
                    data-aos-duration="800"
                  >
                    Editar
                  </button>
                  <button
                    className="boton-eliminar"
                    onClick={() => handleDelete(categoria.id)}
                    data-aos="flip-right"
                    data-aos-duration="800"
                  >
                    Eliminar
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Botón para volver al administrador */}
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

export default CategoriasCRUD;
