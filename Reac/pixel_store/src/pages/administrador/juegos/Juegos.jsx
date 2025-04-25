import React, { useState, useEffect } from "react";
import { useNavigate } from 'react-router-dom';
import AOS from 'aos';
import 'aos/dist/aos.css';
import "../../administrador/admin.css";

const JuegosCRUD = () => {
  const [juegos, setJuegos] = useState([]);
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
  const navigate = useNavigate();

  const fetchJuegos = async () => {
    try {
      const response = await fetch("http://localhost:5000/juegos", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      const data = await response.json();
      if (response.ok) {
        setJuegos(data);
      } else {
        alert(data.mensaje || "Error al cargar los juegos.");
      }
    } catch (error) {
      console.error("Error al cargar juegos:", error);
    }
  };

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
      const response = await fetch(
        "https://api.cloudinary.com/v1_1/dtdxmx8ly/image/upload",
        {
          method: "POST",
          body: formDataImage,
        }
      );
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
          categoria_id: formData.id_categoria
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
        await fetchJuegos();
      } else {
        alert(data.mensaje || "Error al guardar el juego.");
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
      id_categoria: juego.categoria?.id || juego.categoria_id || "",
      imagen_url: juego.imagen_url
    });
  };

  const handleDelete = async (id) => {
    if (window.confirm("¿Estás seguro de eliminar este juego?")) {
      try {
        const response = await fetch(`http://localhost:5000/juego/${id}`, {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });

        if (response.ok) {
          alert("Juego eliminado");
          fetchJuegos();
        } else {
          alert("Error al eliminar juego.");
        }
      } catch (error) {
        console.error("Error al eliminar juego:", error);
      }
    }
  };

  useEffect(() => {
    AOS.init();
    fetchJuegos();
    fetchCategorias();
  }, []);

  return (
    <div>
      <h1 data-aos="fade-down" data-aos-duration="1000">Gestión de Juegos</h1>

      <form onSubmit={handleSubmit} data-aos="fade-up" data-aos-duration="1500" data-aos-delay="200">
        <input
          className="input1"
          type="text"
          name="titulo"
          placeholder="Título"
          value={formData.titulo}
          onChange={handleChange}
          required
        />
        <textarea
          className="input1"
          name="descripcion"
          placeholder="Descripción"
          value={formData.descripcion}
          onChange={handleChange}
        />
        <input
          className="input1"
          type="number"
          name="precio"
          placeholder="Precio"
          value={formData.precio}
          onChange={handleChange}
          required
        />
        <input
          className="input1"
          type="number"
          name="stock"
          placeholder="Stock"
          value={formData.stock}
          onChange={handleChange}
        />
        <select
          className="input1"
          name="condicion"
          value={formData.condicion}
          onChange={handleChange}
        >
          <option value="">Seleccionar condición</option>
          <option value="nuevo">Nuevo</option>
          <option value="usado">Usado</option>
        </select>
        <select
          className="input1"
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
          className="input1"
          type="file"
          accept="image/*"
          onChange={handleImageChange}
        />
        {formData.imagen_url && (
          <div style={{ margin: '10px 0' }}>
            <img 
              src={formData.imagen_url} 
              alt="Preview" 
              style={{ maxWidth: '100px', maxHeight: '100px' }} 
            />
          </div>
        )}
        <button className="boton1" type="submit" data-aos="zoom-in" data-aos-duration="1000">
          {editingJuegoId ? "Actualizar" : "Agregar"}
        </button>
      </form>

      <button 
        className="boton1" 
        onClick={() => navigate('/administrador')}
        style={{ marginTop: "20px", backgroundColor: "#3498db" }}
      >
        Volver al Administrador
      </button>

      <div className="table-container" data-aos="fade-up" data-aos-duration="1500">
        <table>
          <thead>
            <tr>
              <th>Título</th>
              <th>Precio</th>
              <th>Stock</th>
              <th>Condición</th>
              <th>Categoría</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {juegos.map((juego) => (
              <tr key={juego.id} data-aos="fade-left" data-aos-duration="1000">
                <td>
                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    {juego.imagen_url && (
                      <img 
                        src={juego.imagen_url} 
                        alt={juego.titulo} 
                        style={{ 
                          width: '50px', 
                          height: '50px', 
                          objectFit: 'cover',
                          marginRight: '10px',
                          borderRadius: '4px'
                        }} 
                      />
                    )}
                    {juego.titulo}
                  </div>
                </td>
                <td>${juego.precio?.toFixed(2)}</td>
                <td>{juego.stock}</td>
                <td>{juego.condicion === 'nuevo' ? 'Nuevo' : 'Usado'}</td>
                <td>
                  {juego.categoria?.nombre || 
                   categorias.find(c => c.id === juego.categoria_id)?.nombre || 
                   "Sin categoría"}
                </td>
                <td>
                  <button
                    className="boton-editar"
                    onClick={() => handleEdit(juego)}
                    data-aos="flip-left"
                    data-aos-duration="800"
                  >
                    Editar
                  </button>
                  <button
                    className="boton-eliminar"
                    onClick={() => handleDelete(juego.id)}
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
    </div>
  );
};

export default JuegosCRUD;