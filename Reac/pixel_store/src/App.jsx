import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import AOS from 'aos';
import 'aos/dist/aos.css';
import './assets/styles/style.css';

import Header from './components/Header';
import Icons from './components/Icons';
import Footer from './components/Footer';

import Home from './pages/index/Home';
import Login from './pages/login/Login';
import Register from './pages/registra/Register';
import ResetPasswordPage from './pages/reset/ResetPasswordPage';
import ForgotPassword from './pages/reset/ForgotPassword';
import AtencionCliente from './pages/atencion/AtencionCliente';
import SobreNosotros from './pages/atencion/sobre_nosotros.jsx';
import EditarPerfil from './pages/editar/EditarPerfil';

// Admin
import IndexAdmin from './pages/administrador/indexAdmin';
import Usuario from './pages/administrador/usuarios/Usuario';
import CategoriasCRUD from './pages/administrador/categoria/Categoria';
import Juegos from './pages/administrador/juegos/Juegos';
import PromocionForm from './pages/administrador/promocion/PromocionForm';
import ResenaCrud from './pages/administrador/resena/ResenaCrud';
import FacturaCrud from './pages/administrador/factura/FacturasCrud';
import CarritosCRUD from './pages/administrador/carrito/CarritosCrud';
import DivisasCrud from './pages/administrador/divisa/DivisasCrud';

// Vendedor
import Vendedor from './pages/vendedor/Vendedor';

// Catálogo
import Catalogo from './pages/catalogo/Catalogo';
import ProductDetail from './pages/detalle/ProductDetail';
import SearchResults from './pages/buscador/SearchResults';

// Facturas
import FormularioPago from './pages/facturas/FormaPago';
import DetalleFactura from './pages/facturas/DetalleFactura';

// Correos
import EnviarCorreoAdmin from './pages/correos/EnviarCorreoAdmin';

// Carrito
import CarritoUsuario from './pages/carrito/CarritoUsuario';

// Promos
import PromocionesPage from './pages/promociones/PromocionesPage';

function AppContent() {
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith('/administrador');

  useEffect(() => {
    AOS.init({ offset: 1 });
  }, []);

  return (
    <>
      <Header />

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/atencion" element={<AtencionCliente />} />
        <Route path="/sobre" element={<SobreNosotros />} />
        <Route path="/editar-perfil" element={<EditarPerfil />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password/:token" element={<ResetPasswordPage />} />

        <Route path="/administrador" element={<IndexAdmin />} />
        <Route path="/administrador/usuarios" element={<Usuario />} />
        <Route path="/administrador/categorias" element={<CategoriasCRUD />} />
        <Route path="/administrador/juegos" element={<Juegos />} />
        <Route path="/administrador/promociones" element={<PromocionForm />} />
        <Route path="/administrador/enviar-correos" element={<EnviarCorreoAdmin />} />
        <Route path="/administrador/resenas" element={<ResenaCrud />} />
        <Route path="/administrador/factura" element={<FacturaCrud />} />
        <Route path="/administrador/carrito" element={<CarritosCRUD />} />
        <Route path="/administrador/divisa" element={<DivisasCrud />} />

        <Route path="/vendedor" element={<Vendedor />} />
        <Route path="/catalogo" element={<Catalogo />} />
        <Route path="/detalle/:id" element={<ProductDetail />} />
        <Route path="/buscar" element={<SearchResults />} />
        <Route path="/facturas" element={<FormularioPago />} />
        <Route path="/factura/:id_factura" element={<DetalleFactura />} />
        <Route path="/carrito" element={<CarritoUsuario />} />
        <Route path="/promociones" element={<PromocionesPage />} />
      </Routes>

      {!isAdminRoute && <Icons />}
      {!isAdminRoute && <Footer />}
    </>
  );
}

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default App;
