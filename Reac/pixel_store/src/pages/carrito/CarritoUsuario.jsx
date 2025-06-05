import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./CarritoUsuario.css";

const CarritoUsuario = () => {
    const [carrito, setCarrito] = useState([]);
    const [total, setTotal] = useState(0);
    const [descuentoGlobal, setDescuentoGlobal] = useState(0);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    const token = localStorage.getItem("token");

    const obtenerCarrito = async () => {
        try {
            const response = await fetch("https://pixel-store-nii6.onrender.com/mi-carrito", {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            const data = await response.json();

            if (response.ok) {
                setCarrito(data.juegos);
                setTotal(data.total);
                setDescuentoGlobal(data.descuento_global_aplicado || 0);
            } else {
                setError(data.mensaje || "Error al obtener el carrito.");
            }
        } catch (err) {
            setError("Error de conexión.");
        } finally {
            setLoading(false);
        }
    };

    const editarCantidad = async (juegoId, nuevaCantidad) => {
        if (nuevaCantidad < 1) return;

        try {
            await fetch("https://pixel-store-nii6.onrender.com/carrito/editar", {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ juego_id: juegoId, cantidad: nuevaCantidad }),
            });

            obtenerCarrito();
        } catch (err) {
            console.error("Error al editar cantidad:", err);
        }
    };

    const eliminarJuego = async (juegoId) => {
        try {
            await fetch(`https://pixel-store-nii6.onrender.com/carrito/eliminar/${juegoId}`, {
                method: "DELETE",
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            obtenerCarrito();
        } catch (err) {
            console.error("Error al eliminar juego:", err);
        }
    };

    useEffect(() => {
        obtenerCarrito();
    }, []);

    const procederAlPago = () => {
        navigate("/facturas", { state: { total } });
    };

    if (loading) return <p className="carrito-loading">Cargando carrito...</p>;
    if (error) return <p className="carrito-error">Error: {error}</p>;

    return (
        <div className="carrito-container">
            <h2 className="carrito-titulo">🛒 Tu Carrito</h2>
            {carrito.length === 0 ? (
                <p className="carrito-vacio">Tu carrito está vacío. ¡Agrega algo épico!</p>
            ) : (
                <div className="carrito-lista">
                    {carrito.map((item) => {
                        const subtotal = item.subtotal;
                        const descuentos = item.descuentos || [];
                        const totalConDescuento = subtotal;

                        return (
                            <div key={item.juego_id} className="carrito-item">
                                <img
                                    src={item.imagen_url}
                                    alt={item.titulo}
                                    className="carrito-imagen"
                                />
                                <div className="carrito-info">
                                    <h4 className="carrito-titulo-juego">{item.titulo}</h4>
                                    <p className="carrito-precio">
                                        Precio: ${item.precio_unitario.toFixed(2)}
                                    </p>
                                    <p className="carrito-subtotal">
                                        Subtotal: ${(item.precio_unitario * item.cantidad).toFixed(2)}
                                    </p>
                                    {descuentos.map((d, index) => (
                                        <p key={index} className="carrito-descuento">
                                            Descuento {d.tipo}: -${d.descuento.toFixed(2)}
                                        </p>
                                    ))}
                                    <p className="carrito-total-con-descuento">
                                        Total con descuento: ${totalConDescuento.toFixed(2)}
                                    </p>
                                    <div className="carrito-cantidad">
                                        <button
                                            onClick={() => editarCantidad(item.juego_id, item.cantidad - 1)}
                                        >
                                            -
                                        </button>
                                        <span>{item.cantidad}</span>
                                        <button
                                            onClick={() => editarCantidad(item.juego_id, item.cantidad + 1)}
                                        >
                                            +
                                        </button>
                                        <button
                                            className="carrito-eliminar"
                                            onClick={() => eliminarJuego(item.juego_id)}
                                        >
                                            Eliminar
                                        </button>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                    <div className="carrito-total">
                        {descuentoGlobal > 0 && (
                            <p className="carrito-descuento-global">
                                Descuento global aplicado: -${descuentoGlobal.toFixed(2)}
                            </p>
                        )}
                        <h3>Total final: ${total.toFixed(2)}</h3>
                        <button
                            className="carrito-pago"
                            onClick={procederAlPago}
                        >
                            Proceder al pago
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CarritoUsuario;
