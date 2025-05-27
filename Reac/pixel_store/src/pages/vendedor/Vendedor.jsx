import React, { useState, useEffect } from "react";
import AOS from "aos";
import "aos/dist/aos.css";
import "./vendedor.css";

const JuegosVendedor = () => {
  const [categorias, setCategorias] = useState([]);
  const [juegos, setJuegos] = useState([]);
  const [formData, setFormData] = useState({
    titulo: "",
    descripcion: "",
    precio: "",
    stock: "",
    condicion: "",
    id_categoria: "",
    imagen_url: "",
  });
  const [editingJuegoId, setEditingJuegoId] = useState(null);

  useEffect(() => {
    AOS.init();
    fetchCategorias();
    fetchJuegosDelVendedor();
  }, []);

  const fetchCategorias = async () => {
    try {
      const res = await fetch("http://localhost:5000/categorias", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      const data = await res.json();
      if (res.ok) setCategorias(data);
    } catch (error) {
      console.error("Error cargando categorías:", error);
    }
  };

  const fetchJuegosDelVendedor = async () => {
    try {
      const res = await fetch("http://localhost:5000/mis-juegos", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      const data = await res.json();
      if (res.ok) setJuegos(data);
    } catch (error) {
      console.error("Error cargando juegos:", error);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const formDataImg = new FormData();
    formDataImg.append("file", file);
    formDataImg.append("upload_preset", "ml_default");

    try {
      const res = await fetch("https://api.cloudinary.com/v1_1/dtdxmx8ly/image/upload", {
        method: "POST",
        body: formDataImg,
      });
      const data = await res.json();
      if (data.secure_url) {
        setFormData({ ...formData, imagen_url: data.secure_url });
      }
    } catch (error) {
      console.error("Error subiendo imagen:", error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const url = editingJuegoId
      ? `http://localhost:5000/juego/${editingJuegoId}`
      : "http://localhost:5000/juegos";
    const method = editingJuegoId ? "PUT" : "POST";

    try {
      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({
          ...formData,
          categoria_id: formData.id_categoria,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        alert(editingJuegoId ? "Juego actualizado" : "Juego creado");
        setFormData({
          titulo: "",
          descripcion: "",
          precio: "",
          stock: "",
          condicion: "",
          id_categoria: "",
          imagen_url: "",
        });
        setEditingJuegoId(null);
        fetchJuegosDelVendedor();
      } else {
        alert(data.mensaje || "Error al guardar juego");
      }
    } catch (error) {
      console.error("Error al guardar juego:", error);
    }
  };

  const handleEdit = (juego) => {
    setEditingJuegoId(juego.id);
    setFormData({
      titulo: juego.titulo,
      descripcion: juego.descripcion,
      precio: juego.precio,
      stock: juego.stock,
      condicion: juego.condicion,
      id_categoria: juego.categoria_id,
      imagen_url: juego.imagen_url,
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = async (id) => {
    if (!window.confirm("¿Eliminar este juego?")) return;
    try {
      const res = await fetch(`http://localhost:5000/juego/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      if (res.ok) {
        alert("Juego eliminado");
        fetchJuegosDelVendedor();
      }
    } catch (error) {
      console.error("Error al eliminar juego:", error);
    }
  };

  return (
    <div className="vendedor-container">
      <h1 className="titulo">🎮 Panel del Vendedor</h1>

      <form onSubmit={handleSubmit} className="formulario-juego">
        <input type="text" name="titulo" placeholder="Título del juego" value={formData.titulo} onChange={handleChange} required />
        <textarea name="descripcion" placeholder="Descripción" value={formData.descripcion} onChange={handleChange}></textarea>
        <input type="number" name="precio" placeholder="Precio" value={formData.precio} onChange={handleChange} required />
        <input type="number" name="stock" placeholder="Stock" value={formData.stock} onChange={handleChange} />
        <select name="condicion" value={formData.condicion} onChange={handleChange}>
          <option value="">Condición</option>
          <option value="nuevo">Nuevo</option>
          <option value="usado">Usado</option>
        </select>
        <select name="id_categoria" value={formData.id_categoria} onChange={handleChange}>
          <option value="">Categoría</option>
          {categorias.map((cat) => (
            <option key={cat.id} value={cat.id}>
              {cat.nombre}
            </option>
          ))}
        </select>
        <input type="file" accept="image/*" onChange={handleImageChange} />
        {formData.imagen_url && <img src={formData.imagen_url} alt="Preview" className="preview-img" />}
        <button type="submit">{editingJuegoId ? "Actualizar" : "Agregar Juego"}</button>
      </form>

      <h2 className="subtitulo">🕹️ Mis Juegos</h2>
      <div className="juegos-grid">
        {juegos.map((juego) => (
          <div key={juego.id} className="juego-card" data-aos="zoom-in">
            <img src={juego.imagen_url} alt={juego.titulo} className="juego-img" />
            <div className="juego-info">
              <h3>{juego.titulo}</h3>
              <p>{juego.descripcion}</p>
              <p className="precio">${juego.precio}</p>
            </div>
            <div className="acciones">
              <button className="editar" onClick={() => handleEdit(juego)}>
                ✏️ Editar
              </button>
              <button className="eliminar" onClick={() => handleDelete(juego.id)}>
                🗑️ Eliminar
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default JuegosVendedor;
