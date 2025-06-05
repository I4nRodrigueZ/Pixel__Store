import React, { useEffect, useState } from "react";
import AOS from "aos";
import "aos/dist/aos.css";
import "../../administrador/admin.css";
import { useNavigate } from "react-router-dom";
import { FaStar, FaStarHalfAlt, FaRegStar } from "react-icons/fa";

const ResenasCRUD = () => {
  const [resenas, setResenas] = useState([]);
  const [juegos, setJuegos] = useState([]);
  const [usuarios, setUsuarios] = useState([]);
  const [formData, setFormData] = useState({
    puntuacion: 5, // Cambiado a 5 por defecto
    comentario: "",
    juego_id: "",
    usuario_id: "",
  });
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  // Función para cargar todos los datos
  const fetchAllData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const [resenasData, juegosData, usuariosData] = await Promise.all([
        fetchResenas(),
        fetchJuegos(),
        fetchUsuarios(),
      ]);
      
      setResenas(resenasData);
      setJuegos(juegosData);
      setUsuarios(usuariosData);
    } catch (error) {
      setError(error.message);
      console.error("Error al cargar datos:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchResenas = async () => {
    try {
      const response = await fetch("https://pixel-store-nii6.onrender.com/resenas", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
          'Content-Type': 'application/json'
        },
      });
      
      if (!response.ok) {
        if (response.status === 401) {
          throw new Error("No autorizado");
        }
        throw new Error("Error al cargar reseñas");
      }
      
      const data = await response.json();
      return Array.isArray(data) ? data : data.resenas || [];
    } catch (error) {
      console.error("Error al cargar reseñas:", error);
      if (error.message === "No autorizado") {
        alert("Sesión expirada. Por favor inicie sesión nuevamente.");
        navigate("/login");
      }
      throw error;
    }
  };

  const fetchJuegos = async () => {
    try {
      const response = await fetch("https://pixel-store-nii6.onrender.com/juegos", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
          'Content-Type': 'application/json'
        },
      });
      
      if (!response.ok) throw new Error("Error al cargar juegos");
      
      const data = await response.json();
      return Array.isArray(data) ? data : data.juegos || [];
    } catch (error) {
      console.error("Error al cargar juegos:", error);
      throw error;
    }
  };

  const fetchUsuarios = async () => {
    try {
      const response = await fetch("https://pixel-store-nii6.onrender.com/usuarios", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
          'Content-Type': 'application/json'
        },
      });
      
      if (!response.ok) throw new Error("Error al cargar usuarios");
      
      const data = await response.json();
      return Array.isArray(data) ? data : data.usuarios || [];
    } catch (error) {
      console.error("Error al cargar usuarios:", error);
      throw error;
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validación mínima del comentario
    if (formData.comentario.length < 10) {
      alert("El comentario debe tener al menos 10 caracteres");
      return;
    }

    const url = editingId
      ? `https://pixel-store-nii6.onrender.com/resena/${editingId}`
      : "https://pixel-store-nii6.onrender.com/resenas";
    const method = editingId ? "PUT" : "POST";

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
      
      if (!response.ok) {
        throw new Error(data.mensaje || "Error al guardar la reseña");
      }

      alert(editingId ? "Reseña actualizada correctamente" : "Reseña creada exitosamente");
      setFormData({
        puntuacion: 5,
        comentario: "",
        juego_id: "",
        usuario_id: "",
      });
      setEditingId(null);
      fetchAllData();
    } catch (error) {
      console.error("Error:", error);
      alert(error.message);
      if (error.message.includes("No autorizado")) {
        navigate("/login");
      }
    }
  };

  const handleEdit = (resena) => {
    setEditingId(resena.id);
    setFormData({
      puntuacion: resena.puntuacion,
      comentario: resena.comentario,
      juego_id: resena.juego_id || resena.juego?.id || "",
      usuario_id: resena.usuario_id || resena.usuario?.id || "",
    });
  };

  const handleDelete = async (id) => {
    if (!window.confirm("¿Estás seguro de eliminar esta reseña?")) return;
    
    try {
      const response = await fetch(`https://pixel-store-nii6.onrender.com/resena/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
          'Content-Type': 'application/json'
        },
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.mensaje || "Error al eliminar reseña");
      }

      alert("Reseña eliminada correctamente");
      fetchAllData();
    } catch (error) {
      console.error("Error:", error);
      alert(error.message);
    }
  };

  const renderStars = (rating) => {
    const fullStars = Math.floor(rating);
    const halfStar = rating % 1 >= 0.5;
    const emptyStars = 5 - Math.ceil(rating);

    return (
      <>
        {[...Array(fullStars)].map((_, index) => (
          <FaStar key={`full-${index}`} className="filled" />
        ))}
        {halfStar && <FaStarHalfAlt className="filled" />}
        {[...Array(emptyStars)].map((_, index) => (
          <FaRegStar key={`empty-${index}`} className="empty" />
        ))}
      </>
    );
  };

  const handleStarClick = (star) => {
    setFormData({ ...formData, puntuacion: star });
  };

  useEffect(() => {
    AOS.init();
    fetchAllData();
  }, []);

  if (loading) return <div className="loading">Cargando datos...</div>;
  if (error) return <div className="error">{error}</div>;

  return (
    <div>
      <h1 data-aos="fade-down" data-aos-duration="1000">Gestión de Reseñas</h1>

      <form onSubmit={handleSubmit} data-aos="fade-up" data-aos-duration="1500" data-aos-delay="200">
        <div className="form-grid">
          <div className="form-item">
            <label>Usuario:</label>
            <select
              name="usuario_id"
              value={formData.usuario_id}
              onChange={handleChange}
              required
              className="input1"
            >
              <option value="">Selecciona un usuario</option>
              {usuarios.map((user) => (
                <option key={user.id} value={user.id}>
                  {user.nombre} {user.apellido} ({user.email})
                </option>
              ))}
            </select>
          </div>

          <div className="form-item">
            <label>Juego:</label>
            <select
              name="juego_id"
              value={formData.juego_id}
              onChange={handleChange}
              required
              className="input1"
            >
              <option value="">Selecciona un juego</option>
              {juegos.map((juego) => (
                <option key={juego.id} value={juego.id}>
                  {juego.titulo} ({juego.genero})
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="form-item">
          <label>Puntuación:</label>
          <div className="star-rating">
            {[1, 2, 3, 4, 5].map((star) => (
              <FaStar
                key={star}
                onClick={() => handleStarClick(star)}
                className={star <= formData.puntuacion ? "filled" : "empty"}
              />
            ))}
          </div>
        </div>

        <div className="form-item">
          <label>Comentario:</label>
          <textarea
            name="comentario"
            value={formData.comentario}
            onChange={handleChange}
            rows="4"
            placeholder="Escribe tu opinión sobre el juego (mínimo 10 caracteres)..."
            required
            minLength="10"
            className="input1"
          />
        </div>

        <button className="boton1" type="submit" data-aos="zoom-in" data-aos-duration="1000">
          {editingId ? "Actualizar" : "Agregar"}
        </button>
      </form>

      <div className="table-container" data-aos="fade-up" data-aos-duration="1500">
        <table>
          <thead>
            <tr>
              <th>Usuario</th>
              <th>Juego</th>
              <th>Puntuación</th>
              <th>Comentario</th>
              <th>Fecha</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {resenas.map((resena) => (
              <tr key={resena.id} data-aos="fade-left" data-aos-duration="1000">
                <td>
                  {resena.usuario?.nombre || 
                   usuarios.find(u => u.id === resena.usuario_id)?.nombre || 
                   `ID: ${resena.usuario_id}`}
                </td>
                <td>
                  {resena.juego?.titulo || 
                   juegos.find(j => j.id === resena.juego_id)?.titulo || 
                   `ID: ${resena.juego_id}`}
                </td>
                <td>{renderStars(resena.puntuacion)}</td>
                <td>{resena.comentario}</td>
                <td>{new Date(resena.fecha).toLocaleDateString()}</td>
                <td>
                  <button className="boton-editar" onClick={() => handleEdit(resena)}>Editar</button>
                  <button className="boton-eliminar" onClick={() => handleDelete(resena.id)}>Eliminar</button>
                </td>
              </tr>
            ))}
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

export default ResenasCRUD;