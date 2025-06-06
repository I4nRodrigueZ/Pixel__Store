import React, { useState, useEffect } from "react";
import { Search, X } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import "./SearchBar.css"; 

const SearchBar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedMinPrice, setSelectedMinPrice] = useState("");
  const [selectedMaxPrice, setSelectedMaxPrice] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [categorias, setCategorias] = useState([]);
  const navigate = useNavigate();
  const location = useLocation(); // Detecta cambios de página

  useEffect(() => {
    if (isOpen) fetchCategorias();
  }, [isOpen]);

  useEffect(() => {
    setIsOpen(false); // Cierra el buscador al cambiar de página
  }, [location.pathname]);

  const fetchCategorias = async () => {
    try {
      const response = await fetch("https://pixel-store-nii6.onrender.com/categorias");
      const data = await response.json();
      if (response.ok) setCategorias(data);
    } catch (error) {
      console.error("Error al cargar las categorías:", error);
    }
  };

  const handleSearch = async () => {
    if (searchTerm.trim() || selectedMinPrice || selectedMaxPrice || selectedCategory) {
      const queryParams = new URLSearchParams();
      if (searchTerm) queryParams.set("q", searchTerm);
      if (selectedMinPrice) queryParams.set("min_price", selectedMinPrice);
      if (selectedMaxPrice) queryParams.set("max_price", selectedMaxPrice);
      if (selectedCategory) queryParams.set("category_id", selectedCategory);

      try {
        const response = await fetch(`https://pixel-store-nii6.onrender.com/juegos?${queryParams}`);
        const data = await response.json();
        if (response.ok) navigate("/buscar", { state: { juegos: data } });
      } catch (error) {
        console.error("Error al buscar juegos:", error);
      }

      setIsOpen(false);
    }
  };

  return (
    <div className="search-bar-container">
      <button onClick={() => setIsOpen(!isOpen)} className="search-button">
        <Search size={20} />
      </button>

      <div className={`search-sidebar ${isOpen ? "open" : ""}`}>
        <div className="sidebar-header">
          <h2>Filtrar y buscar</h2>
          <button onClick={() => setIsOpen(false)} className="close-button">
            <X size={20} />
          </button>
        </div>

        <div className="filter-section">
          <h3>Categoría</h3>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="filter-select"
          >
            <option value="">Todas</option>
            {categorias.map((cat) => (
              <option key={cat.id} value={cat.id}>{cat.nombre}</option>
            ))}
          </select>
        </div>

        <div className="filter-section">
          <h3>Rango de Precio</h3>
          <div className="price-inputs">
            <input
              type="number"
              placeholder="Mínimo"
              value={selectedMinPrice}
              onChange={(e) => setSelectedMinPrice(e.target.value)}
            />
            <input
              type="number"
              placeholder="Máximo"
              value={selectedMaxPrice}
              onChange={(e) => setSelectedMaxPrice(e.target.value)}
            />
          </div>
        </div>

        <div className="search-input-section">
          <input
            type="text"
            placeholder="Buscar juego por título..."
            className="search-input"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <button onClick={handleSearch} className="search-submit">Buscar</button>
      </div>
    </div>
  );
};

export default SearchBar;
