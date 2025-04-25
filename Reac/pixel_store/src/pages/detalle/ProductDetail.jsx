import React, { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { FaStar, FaStarHalfAlt, FaRegStar } from "react-icons/fa";
import "./ProductDetail.css";

const ProductDetail = () => {
    const { id } = useParams();
    const [juego, setJuego] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showLoginAlert, setShowLoginAlert] = useState(false);
    const [showAddedAlert, setShowAddedAlert] = useState(false);
    const [showStockAlert, setShowStockAlert] = useState(false);
    const [selectedImage, setSelectedImage] = useState(0);
    const [resenas, setResenas] = useState([]);
    const [nuevaResena, setNuevaResena] = useState({
        comentario: "",
        puntuacion: 5,
        juego_id: id
    });
    const [mostrarFormResena, setMostrarFormResena] = useState(false);
    const [alertMessage, setAlertMessage] = useState("");
    const [paginacion, setPaginacion] = useState({
        paginaActual: 1,
        totalPaginas: 1,
        totalResenas: 0
    });
    const [hoverRating, setHoverRating] = useState(0);
    const navigate = useNavigate();

    const fetchJuego = useCallback(async () => {
        try {
            const response = await fetch(`http://localhost:5000/juego/${id}`);
            const data = await response.json();
            if (response.ok) {
                setJuego({
                    ...data,
                    imagenes: [
                        data.imagen_url,
                        "https://via.placeholder.com/600x400/222/ffd54f?text=Game+Preview",
                        "https://via.placeholder.com/600x400/222/ffd54f?text=Gameplay"
                    ]
                });
                fetchResenas(1);
                
                // Mostrar alerta si el stock es 0
                if (data.stock <= 0) {
                    setAlertMessage("Este producto está actualmente agotado. ¡Vuelve pronto!");
                    setShowStockAlert(true);
                }
            } else {
                setError(data.mensaje || "Error al cargar el juego.");
            }
        } catch (error) {
            setError("No se pudo conectar con el servidor.");
        } finally {
            setLoading(false);
        }
    }, [id]);

    const fetchResenas = async (pagina = 1) => {
        try {
            const response = await fetch(`http://localhost:5000/resenas?juego_id=${id}&pagina=${pagina}&por_pagina=5`);
            const data = await response.json();
            
            if (response.ok) {
                setResenas(data.resenas || []);
                setPaginacion({
                    paginaActual: data.pagina || 1,
                    totalPaginas: data.paginas || 1,
                    totalResenas: data.total || 0
                });
            }
        } catch (error) {
            console.error("Error al cargar reseñas:", error);
        }
    };

    const handleActionClick = async (action) => {
        const token = localStorage.getItem("token");
        if (!token) {
            setAlertMessage("Por favor, inicia sesión para realizar esta acción");
            setShowLoginAlert(true);
            return;
        }

        // Verificar stock antes de cualquier acción
        if (juego.stock <= 0) {
            setAlertMessage("Este producto está agotado y no se puede agregar al carrito.");
            setShowStockAlert(true);
            return;
        }

        try {
            const response = await fetch("http://localhost:5000/carrito/agregar", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({
                    juego_id: juego.id,
                    cantidad: 1
                })
            });

            const data = await response.json();

            if (response.ok) {
                if (action === "Agregar al carrito") {
                    setAlertMessage("¡Producto agregado al carrito con éxito!");
                    setShowAddedAlert(true);
                } else if (action === "Comprar") {
                    navigate("/carrito");
                }
            } else {
                setAlertMessage(data.mensaje || "Error al procesar tu solicitud");
                setShowLoginAlert(true);
            }
        } catch (err) {
            setAlertMessage("Error de conexión con el servidor");
            setShowLoginAlert(true);
        }
    };

    const handleResenaSubmit = async (e) => {
        e.preventDefault();
        const token = localStorage.getItem("token");
        
        if (!token) {
            setAlertMessage("Por favor, inicia sesión para escribir una reseña");
            setShowLoginAlert(true);
            return;
        }

        if (nuevaResena.comentario.trim().length < 10) {
            setAlertMessage("El comentario debe tener al menos 10 caracteres");
            setShowLoginAlert(true);
            return;
        }

        try {
            const response = await fetch("http://localhost:5000/resenas", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({
                    comentario: nuevaResena.comentario,
                    puntuacion: nuevaResena.puntuacion,
                    juego_id: id
                })
            });

            const data = await response.json();

            if (response.ok) {
                fetchResenas(paginacion.paginaActual);
                setNuevaResena({
                    comentario: "",
                    puntuacion: 5,
                    juego_id: id
                });
                setMostrarFormResena(false);
                setAlertMessage("¡Reseña publicada con éxito!");
                setShowAddedAlert(true);
            } else {
                setAlertMessage(data.mensaje || "Error al enviar la reseña");
                setShowLoginAlert(true);
            }
        } catch (err) {
            setAlertMessage("Error de conexión al servidor");
            setShowLoginAlert(true);
        }
    };

    const handleResenaChange = (e) => {
        const { name, value } = e.target;
        setNuevaResena({
            ...nuevaResena,
            [name]: name === 'puntuacion' ? parseInt(value) : value
        });
    };

    const calcularPromedioResenas = () => {
        if (resenas.length === 0) return 0;
        const suma = resenas.reduce((acc, resena) => acc + resena.puntuacion, 0);
        return (suma / resenas.length).toFixed(1);
    };

    const closeAlert = () => {
        setShowLoginAlert(false);
        setShowAddedAlert(false);
        setShowStockAlert(false);
    };

    const cambiarPaginaResenas = (nuevaPagina) => {
        if (nuevaPagina >= 1 && nuevaPagina <= paginacion.totalPaginas) {
            fetchResenas(nuevaPagina);
        }
    };

    const StarRatingInput = ({ rating, setRating }) => {
        return (
            <div className="star-rating-input">
                {[1, 2, 3, 4, 5].map((star) => (
                    <FaStar
                        key={star}
                        className={star <= (hoverRating || rating) ? "star-filled" : "star-empty"}
                        onClick={() => setRating(star)}
                        onMouseEnter={() => setHoverRating(star)}
                        onMouseLeave={() => setHoverRating(0)}
                    />
                ))}
                <span className="rating-text">
                    {hoverRating > 0 ? hoverRating : rating} {hoverRating > 0 ? "estrellas" : rating === 1 ? "estrella" : "estrellas"}
                </span>
            </div>
        );
    };

    const StarRatingDisplay = ({ rating }) => {
        const fullStars = Math.floor(rating);
        const hasHalfStar = rating % 1 >= 0.5;
        const emptyStars = 5 - Math.ceil(rating);

        return (
            <div className="star-rating-display">
                {[...Array(fullStars)].map((_, i) => (
                    <FaStar key={`full-${i}`} className="star-filled" />
                ))}
                {hasHalfStar && <FaStarHalfAlt className="star-filled" />}
                {[...Array(emptyStars)].map((_, i) => (
                    <FaRegStar key={`empty-${i}`} className="star-empty" />
                ))}
                <span className="rating-value">({rating})</span>
            </div>
        );
    };

    useEffect(() => {
        fetchJuego();
    }, [fetchJuego]);

    if (loading) {
        return (
            <div className="loading-screen">
                <div className="loading-animation">
                    <div className="pixel-loader"></div>
                    <p>Cargando datos del juego...</p>
                </div>
            </div>
        );
    }

    if (error) return <p className="error-message">🚨 {error}</p>;
    if (!juego) return <p className="error-message">🎮 No se encontró el juego.</p>;

    const precioConDescuento = juego.precio_con_descuento || juego.precio;
    const tieneDescuento = juego.precio_con_descuento && juego.precio_con_descuento < juego.precio;
    const porcentajeDescuento = tieneDescuento 
        ? (((juego.precio - juego.precio_con_descuento) / juego.precio) * 100).toFixed(0) 
        : null;

    return (
        <div className="product-detail">
            <div className="game-header">
                <h1 className="game-title">{juego.titulo}</h1>
                <div className="game-rating">
                    <StarRatingDisplay rating={parseFloat(calcularPromedioResenas())} />
                    <span className="rating-count">({paginacion.totalResenas} reseñas)</span>
                </div>
            </div>
            
            <div className="product-content">
                <div className="image-section">
                    <div className="main-image-container">
                        <img 
                            src={juego.imagenes[selectedImage]} 
                            alt={juego.titulo} 
                            className="product-image" 
                        />
                        {juego.stock > 0 && <div className="image-badge">NUEVO</div>}
                    </div>
                    <div className="thumbnail-gallery">
                        {juego.imagenes.map((img, index) => (
                            <img
                                key={index}
                                src={img}
                                alt={`Preview ${index + 1}`}
                                className={`thumbnail ${selectedImage === index ? 'active' : ''}`}
                                onClick={() => setSelectedImage(index)}
                            />
                        ))}
                    </div>
                </div>

                <div className="product-info">
                    <div className="game-meta">
                        <div className="meta-item">
                            <span className="meta-label">Género:</span>
                            <span className="meta-value">{juego.genero || "Aventura"}</span>
                        </div>
                        <div className="meta-item">
                            <span className="meta-label">Plataforma:</span>
                            <span className="meta-value">{juego.plataforma || "Multiplataforma"}</span>
                        </div>
                        <div className="meta-item">
                            <span className="meta-label">Desarrollador:</span>
                            <span className="meta-value">{juego.desarrollador || "Indie Studio"}</span>
                        </div>
                    </div>

                    <div className="price-section">
                        <div className="price-container">
                            {tieneDescuento && (
                                <span className="original-price">${juego.precio.toFixed(2)}</span>
                            )}
                            <span className="current-price">
                                ${precioConDescuento.toFixed(2)}
                            </span>
                            {tieneDescuento && (
                                <span className="discount-badge">
                                    -{porcentajeDescuento}%
                                </span>
                            )}
                        </div>
                        <div className="stock-status">
                            <span className={`stock-indicator ${juego.stock > 0 ? 'in-stock' : 'out-of-stock'}`}>
                                {juego.stock > 0 ? '🟢 EN STOCK' : '🔴 AGOTADO'}
                            </span>
                            <span className="stock-quantity">({juego.stock} unidades disponibles)</span>
                        </div>
                    </div>

                    <div className="game-description">
                        <h3 className="section-title">📖 Descripción del Juego</h3>
                        <p>{juego.descripcion}</p>
                        <div className="game-features">
                            <h3 className="section-title">✨ Características</h3>
                            <ul>
                                <li>Modo historia épica de 40+ horas</li>
                                <li>Gráficos 4K HDR</li>
                                <li>Multijugador online para hasta 16 jugadores</li>
                                <li>Compatibilidad con cross-play</li>
                                <li>Contenido descargable exclusivo</li>
                            </ul>
                        </div>
                    </div>

                    <div className="product-actions">
                        <button 
                            className="buy-button" 
                            onClick={() => handleActionClick("Comprar")}
                            disabled={juego.stock <= 0}
                        >
                            <span className="button-icon">🎮</span>
                            <span className="button-text">Comprar ahora</span>
                            <span className="button-extra">Entrega en 24h</span>
                        </button>
                        <button 
                            className="cart-button" 
                            onClick={() => handleActionClick("Agregar al carrito")}
                            disabled={juego.stock <= 0}
                        >
                            <span className="button-icon">🛒</span>
                            <span className="button-text">Añadir al carrito</span>
                        </button>
                    </div>

                    <div className="game-specs">
                        <h3 className="section-title">⚙️ Especificaciones Técnicas</h3>
                        <div className="specs-grid">
                            <div className="spec-item">
                                <span className="spec-label">Condición:</span>
                                <span className="spec-value">{juego.condicion}</span>
                            </div>
                            <div className="spec-item">
                                <span className="spec-label">Idiomas:</span>
                                <span className="spec-value">Español, Inglés, Francés</span>
                            </div>
                            <div className="spec-item">
                                <span className="spec-label">Clasificación:</span>
                                <span className="spec-value">PEGI 16</span>
                            </div>
                            <div className="spec-item">
                                <span className="spec-label">Tamaño:</span>
                                <span className="spec-value">50 GB</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="resenas-section">
                <h2 className="section-title">📝 Reseñas de Usuarios ({paginacion.totalResenas})</h2>
                
                <button 
                    className="add-resena-button"
                    onClick={() => {
                        const token = localStorage.getItem("token");
                        if (!token) {
                            setAlertMessage("Por favor, inicia sesión para escribir una reseña");
                            setShowLoginAlert(true);
                            return;
                        }
                        setMostrarFormResena(!mostrarFormResena);
                    }}
                >
                    {mostrarFormResena ? "Cancelar" : "Escribir una reseña"}
                </button>

                {mostrarFormResena && (
                    <form className="resena-form" onSubmit={handleResenaSubmit}>
                        <div className="form-group">
                            <label>Puntuación:</label>
                            <StarRatingInput 
                                rating={nuevaResena.puntuacion} 
                                setRating={(val) => setNuevaResena({...nuevaResena, puntuacion: val})} 
                            />
                        </div>
                        <div className="form-group">
                            <label>Comentario (mínimo 10 caracteres):</label>
                            <textarea
                                name="comentario"
                                value={nuevaResena.comentario}
                                onChange={handleResenaChange}
                                required
                                minLength="10"
                                placeholder="Comparte tu experiencia con este juego..."
                                rows="4"
                            />
                        </div>
                        <div className="form-actions">
                            <button 
                                type="submit" 
                                className="submit-resena-button"
                                disabled={nuevaResena.comentario.trim().length < 10}
                            >
                                Enviar Reseña
                            </button>
                        </div>
                    </form>
                )}

                <div className="resenas-list">
                    {resenas.length === 0 ? (
                        <p className="no-resenas">Aún no hay reseñas para este juego. ¡Sé el primero en opinar!</p>
                    ) : (
                        <>
                            {resenas.map(resena => (
                                <div key={resena.id} className="resena-card">
                                    <div className="resena-header">
                                        <div className="resena-user-info">
                                            <span className="resena-user-avatar">
                                                {resena.usuario?.nombre?.charAt(0).toUpperCase() || 'U'}
                                            </span>
                                            <span className="resena-user-name">
                                                {resena.usuario?.nombre || `Usuario ${resena.usuario_id}`}
                                            </span>
                                        </div>
                                        <div className="resena-meta">
                                            <StarRatingDisplay rating={resena.puntuacion} />
                                            <span className="resena-date">
                                                {new Date(resena.fecha).toLocaleDateString('es-ES', {
                                                    year: 'numeric',
                                                    month: 'long',
                                                    day: 'numeric'
                                                })}
                                                {resena.editada && (
                                                    <span className="resena-edited"> (editada)</span>
                                                )}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="resena-comment">
                                        {resena.comentario}
                                    </div>
                                </div>
                            ))}
                            
                            {paginacion.totalPaginas > 1 && (
                                <div className="resenas-pagination">
                                    <button
                                        onClick={() => cambiarPaginaResenas(paginacion.paginaActual - 1)}
                                        disabled={paginacion.paginaActual === 1}
                                    >
                                        Anterior
                                    </button>
                                    <span>
                                        Página {paginacion.paginaActual} de {paginacion.totalPaginas}
                                    </span>
                                    <button
                                        onClick={() => cambiarPaginaResenas(paginacion.paginaActual + 1)}
                                        disabled={paginacion.paginaActual === paginacion.totalPaginas}
                                    >
                                        Siguiente
                                    </button>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>

            {(showLoginAlert || showAddedAlert || showStockAlert) && (
                <div className="alert-modal">
                    <div className="alert-content">
                        <h3>{showLoginAlert ? "Acción requerida" : showStockAlert ? "Producto agotado" : "¡Éxito!"}</h3>
                        <p>{alertMessage}</p>
                        <div className="alert-buttons">
                            {showLoginAlert && (
                                <button 
                                    className="alert-login-button"
                                    onClick={() => navigate("/login", { state: { from: window.location.pathname } })}
                                >
                                    Ir a Iniciar Sesión
                                </button>
                            )}
                            <button 
                                onClick={closeAlert} 
                                className={`alert-close-button ${showLoginAlert ? 'with-login' : ''}`}
                            >
                                {showAddedAlert ? "Continuar comprando" : "Cerrar"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ProductDetail;