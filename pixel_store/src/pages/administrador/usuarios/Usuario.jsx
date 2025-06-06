import React, { useState, useEffect } from "react";
import { useNavigate } from 'react-router-dom'; // Importar useNavigate de React Router
import AOS from 'aos'; // Importar AOS
import 'aos/dist/aos.css'; // Importar los estilos de AOS
import "../../administrador/admin.css"; // Subir dos niveles en la estructura de carpetas

const UsuariosCRUD = () => {
  const [usuarios, setUsuarios] = useState([]);
  const [formData, setFormData] = useState({
    nombre: "",
    apellido: "",
    email: "",
    contrasena: "",
    rol: "", // Cambié 'nombre_rol' por 'rol'
    telefono: "",
    direccion: "",
    fecha_registro: "",
  });
  const [editingUserId, setEditingUserId] = useState(null);
  const navigate = useNavigate(); // Inicializar el hook para la navegación

  // Función para obtener usuarios desde el servidor
  const fetchUsuarios = async () => {
    try {
      const response = await fetch("https://pixel-store-nii6.onrender.com/usuarios", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      const data = await response.json();
      if (response.ok) {
        setUsuarios(data);
      } else {
        alert(data.mensaje || "Error al cargar los usuarios.");
      }
    } catch (error) {
      console.error("Error al cargar usuarios:", error);
    }
  };

  // Manejar los cambios en el formulario
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  // Manejar el envío del formulario
  const handleSubmit = async (e) => {
    e.preventDefault();

    const url = editingUserId
      ? `https://pixel-store-nii6.onrender.com/usuario/${editingUserId}`
      : "https://pixel-store-nii6.onrender.com/usuarios";
    const method = editingUserId ? "PUT" : "POST";

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
        alert(editingUserId ? "Usuario actualizado" : "Usuario creado");
        fetchUsuarios();
        setFormData({
          nombre: "",
          apellido: "",
          email: "",
          contrasena: "",
          rol: "", // Cambié 'nombre_rol' por 'rol'
          telefono: "",
          direccion: "",
          fecha_registro: "",
        });
        setEditingUserId(null);
      } else {
        alert(data.mensaje || "Error al guardar el usuario.");
      }
    } catch (error) {
      console.error("Error al guardar usuario:", error);
    }
  };

  // Manejar la edición de un usuario
  const handleEdit = (usuario) => {
    setEditingUserId(usuario.id);
    setFormData({
      nombre: usuario.nombre,
      apellido: usuario.apellido,
      email: usuario.email,
      contrasena: "",
      rol: usuario.rol, // Cambié 'nombre_rol' por 'rol'
      telefono: usuario.telefono,
      direccion: usuario.direccion,
      fecha_registro: usuario.fecha_registro,
    });
  };

  // Manejar la eliminación de un usuario
  const handleDelete = async (id) => {
    try {
      const response = await fetch(`https://pixel-store-nii6.onrender.com/usuario/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      if (response.ok) {
        alert("Usuario eliminado");
        fetchUsuarios();
      } else {
        alert("Error al eliminar usuario.");
      }
    } catch (error) {
      console.error("Error al eliminar usuario:", error);
    }
  };

  // Inicialización de AOS
  useEffect(() => {
    AOS.init();
    fetchUsuarios();
  }, []);

  // Función para manejar el redireccionamiento al administrador
  const handleGoToAdmin = () => {
    navigate("/administrador");
  };

  return (
    <div>
      <h1 data-aos="fade-down" data-aos-duration="1000">Gestión de Usuarios</h1>

      <form onSubmit={handleSubmit} data-aos="fade-up" data-aos-duration="1500" data-aos-delay="200">
        <input
          className="input1"
          type="text"
          name="nombre"
          placeholder="Nombre"
          value={formData.nombre}
          onChange={handleChange}
          required
        />
        <input
          className="input1"
          type="text"
          name="apellido"
          placeholder="Apellido"
          value={formData.apellido}
          onChange={handleChange}
          required
        />
        <input
          className="input1"
          type="email"
          name="email"
          placeholder="Email"
          value={formData.email}
          onChange={handleChange}
          required
        />
        <input
          className="input1"
          type="password"
          name="contrasena"
          placeholder="Contraseña"
          value={formData.contrasena}
          onChange={handleChange}
          required
        />
        <select
          className="input1"
          name="rol"
          value={formData.rol} // Cambié 'nombre_rol' por 'rol'
          onChange={handleChange}
          required
        >
          <option value="">Seleccionar rol</option>
          <option value="usuario">Usuario</option>
          <option value="vendedor">Vendedor</option>
        </select>
        <input
          className="input1"
          type="text"
          name="telefono"
          placeholder="Teléfono"
          value={formData.telefono}
          onChange={handleChange}
        />
        <input
          className="input1"
          type="text"
          name="direccion"
          placeholder="Dirección"
          value={formData.direccion}
          onChange={handleChange}
        />
        <input
          className="input1"
          type="date"
          name="fecha_registro"
          value={formData.fecha_registro}
          onChange={handleChange}
          required
        />
        <button className="boton1" type="submit" data-aos="zoom-in" data-aos-duration="1000">
          {editingUserId ? "Actualizar" : "Agregar"}
        </button>
      </form>

      {/* Botón para volver al administrador */}
      <button 
        className="boton1" 
        onClick={handleGoToAdmin}
        style={{ marginTop: "20px", backgroundColor: "#3498db" }}
      >
        Volver al Administrador
      </button>

      <div className="table-container" data-aos="fade-up" data-aos-duration="1500">
        <table>
          <thead>
            <tr>
              <th>Nombre</th>
              <th>Email</th>
              <th>Rol</th>
              <th>Teléfono</th>
              <th>Dirección</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {usuarios.map((usuario) => (
              <tr key={usuario.id} data-aos="fade-left" data-aos-duration="1000">
                <td>{usuario.nombre} {usuario.apellido}</td>
                <td>{usuario.email}</td>
                <td>{usuario.rol}</td>
                <td>{usuario.telefono}</td>
                <td>{usuario.direccion}</td>
                <td>
                  <button
                    className="boton-editar"
                    onClick={() => handleEdit(usuario)}
                    data-aos="flip-left"
                    data-aos-duration="800"
                  >
                    Editar
                  </button>
                  <button
                    className="boton-eliminar"
                    onClick={() => handleDelete(usuario.id)}
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

export default UsuariosCRUD;
