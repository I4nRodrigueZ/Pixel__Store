import React, { useState } from 'react';
import { motion } from 'framer-motion';
import toast, { Toaster } from 'react-hot-toast';
import "./atencion.css";

const AtencionCliente = () => {
  const [formulario, setFormulario] = useState({
    nombre: '',
    apellido: '',
    telefono: '',
    correo: '',
    descripcion: '',
  });

  const handleChange = (e) => {
    setFormulario({ ...formulario, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    toast.success('¡Pronto nos contactaremos contigo! 💌');
    setFormulario({
      nombre: '',
      apellido: '',
      telefono: '',
      correo: '',
      descripcion: '',
    });
  };

  return (
    <div className="contenedor-atencion">
      <Toaster position="top-right" />
      <motion.div
        className="form-retro"
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        <h2>¿Tienes algún problema o sugerencia?</h2>
        <p className="sub">Déjanos tus datos y nos pondremos en contacto 💌</p>
        <form onSubmit={handleSubmit}>
          <input type="text" name="nombre" placeholder="Nombre" required value={formulario.nombre} onChange={handleChange} />
          <input type="text" name="apellido" placeholder="Apellido" required value={formulario.apellido} onChange={handleChange} />
          <input type="tel" name="telefono" placeholder="Teléfono" required value={formulario.telefono} onChange={handleChange} />
          <input type="email" name="correo" placeholder="Correo" required value={formulario.correo} onChange={handleChange} />
          <textarea name="descripcion" placeholder="Describe tu problema o duda aquí..." rows="4" required value={formulario.descripcion} onChange={handleChange} />
          <button type="submit" className="btn-retro">Enviar mensaje 📩</button>
        </form>
      </motion.div>
    </div>
  );
};

export default AtencionCliente;
