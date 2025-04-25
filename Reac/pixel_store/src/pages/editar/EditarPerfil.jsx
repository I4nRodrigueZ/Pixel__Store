import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import axios from 'axios';
import { motion } from 'framer-motion';
import './editarPerfil.css';

const EditarPerfil = () => {
  const [usuario, setUsuario] = useState({
    nombre: '',
    apellido: '',
    email: '',
    telefono: '',
    direccion: '',
    rol: '',
  });

  const navigate = useNavigate();
  const idUsuario = localStorage.getItem('id_usuario');
  const token = localStorage.getItem('token');

  useEffect(() => {
    const obtenerUsuario = async () => {
      try {
        const res = await axios.get(`http://localhost:5000/usuario/${idUsuario}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const data = res.data;

        setUsuario({
          nombre: data.nombre || '',
          apellido: data.apellido || '',
          email: data.email || '',
          telefono: data.telefono || '',
          direccion: data.direccion || '',
          rol: data.rol || '',
        });
      } catch (error) {
        console.log(error);
        toast.error('Error al cargar la información del usuario');
      }
    };

    if (idUsuario && token) {
      obtenerUsuario();
    } else {
      toast.error('No estás autenticado');
      navigate('/login');
    }
  }, [idUsuario, token, navigate]);

  const handleChange = (e) => {
    setUsuario({ ...usuario, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const datosActualizados = {
        nombre: usuario.nombre,
        apellido: usuario.apellido,
        email: usuario.email,
        telefono: usuario.telefono,
        direccion: usuario.direccion,
      };

      await axios.put(
        `http://localhost:5000/usuario/${idUsuario}`,
        datosActualizados,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      alert('Perfil editado con éxito');
      navigate('/');
    } catch (error) {
      console.log(error);
      toast.error('Hubo un error al actualizar tu perfil');
    }
  };

  return (
    <div className="editar-perfil">
      <motion.div
        className="form-retro"
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        <h2>Editar tu perfil</h2>
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            name="nombre"
            placeholder="Nombre"
            value={usuario.nombre}
            onChange={handleChange}
            required
          />
          <input
            type="text"
            name="apellido"
            placeholder="Apellido"
            value={usuario.apellido}
            onChange={handleChange}
            required
          />
          <input
            type="email"
            name="email"
            placeholder="Correo electrónico"
            value={usuario.email}
            onChange={handleChange}
            required
          />
          <input
            type="tel"
            name="telefono"
            placeholder="Teléfono"
            value={usuario.telefono}
            onChange={handleChange}
          />
          <input
            type="text"
            name="direccion"
            placeholder="Dirección"
            value={usuario.direccion}
            onChange={handleChange}
          />
          <button type="submit" className="btn-retro">Actualizar perfil</button>
        </form>
      </motion.div>
    </div>
  );
};

export default EditarPerfil;
