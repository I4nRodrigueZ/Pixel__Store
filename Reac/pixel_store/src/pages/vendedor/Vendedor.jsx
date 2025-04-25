import React, { useState, useEffect } from "react";
import AOS from "aos";
import "aos/dist/aos.css";

const JuegosVendedor = () => {
  const [categorias, setCategorias] = useState([]);
  const [formData, setFormData] = useState({
    titulo: "",
    descripcion: "",
    precio: "",
    stock: "",
    condicion: "",
    id_categoria: "",
    imagen_url: ""
  });
  const [editingJuegoId, setEditingJuegoId] = useState(null);

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
      } else {
        alert(data.mensaje || "Error al cargar las categorías.");
      }
    } catch (error) {
      console.error("Error al cargar categorías:", error);
    }
  };

  useEffect(() => {
    AOS.init();
    fetchCategorias();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formDataImage = new FormData();
    formDataImage.append("file", file);
    formDataImage.append("upload_preset", "ml_default");

    try {
      const response = await fetch("https://api.cloudinary.com/v1_1/dtdxmx8ly/image/upload", {
        method: "POST",
        body: formDataImage,
      });
      const data = await response.json();
      if (data.secure_url) {
        setFormData({ ...formData, imagen_url: data.secure_url });
      } else {
        alert("Error al subir la imagen.");
      }
    } catch (error) {
      console.error("Error al subir imagen:", error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const url = editingJuegoId
      ? `http://localhost:5000/juego/${editingJuegoId}`
      : "http://localhost:5000/juegos";
    const method = editingJuegoId ? "PUT" : "POST";

    try {
      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({
          ...formData,
          categoria_id: formData.id_categoria,
          user_id: localStorage.getItem("user_id")
        }),
      });
      const data = await response.json();
      if (response.ok) {
        alert(editingJuegoId ? "Juego actualizado" : "Juego creado");
        setFormData({
          titulo: "",
          descripcion: "",
          precio: "",
          stock: "",
          condicion: "",
          id_categoria: "",
          imagen_url: ""
        });
        setEditingJuegoId(null);
      } else {
        alert(data.mensaje || "Error al guardar el juego.");
      }
    } catch (error) {
      console.error("Error al guardar juego:", error);
    }
  };

  return (
    <div>
      <h1>Gestión de Juegos</h1>

      <form onSubmit={handleSubmit}>
        <input
          type="text"
          name="titulo"
          placeholder="Título"
          value={formData.titulo}
          onChange={handleChange}
          required
        />
        <textarea
          name="descripcion"
          placeholder="Descripción"
          value={formData.descripcion}
          onChange={handleChange}
        />
        <input
          type="number"
          name="precio"
          placeholder="Precio"
          value={formData.precio}
          onChange={handleChange}
          required
        />
        <input
          type="number"
          name="stock"
          placeholder="Stock"
          value={formData.stock}
          onChange={handleChange}
        />
        <select
          name="condicion"
          value={formData.condicion}
          onChange={handleChange}
        >
          <option value="">Seleccionar condición</option>
          <option value="nuevo">Nuevo</option>
          <option value="usado">Usado</option>
        </select>
        <select
          name="id_categoria"
          value={formData.id_categoria}
          onChange={handleChange}
          required
        >
          <option value="">Seleccionar categoría</option>
          {categorias.map((categoria) => (
            <option key={categoria.id} value={categoria.id}>
              {categoria.nombre}
            </option>
          ))}
        </select>
        <input
          type="file"
          accept="image/*"
          onChange={handleImageChange}
        />
        {formData.imagen_url && <img src={formData.imagen_url} alt="Preview" />}
        <button type="submit">
          {editingJuegoId ? "Actualizar" : "Agregar"}
        </button>
      </form>
    </div>
  );
};

export default JuegosVendedor;
