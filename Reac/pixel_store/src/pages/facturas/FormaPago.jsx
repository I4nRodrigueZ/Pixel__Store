import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import './FormaPago.css';

const FormaPago = () => {
    const [divisas, setDivisas] = useState([]);
    const [metodoPago, setMetodoPago] = useState('Nequi');
    const [divisaSeleccionada, setDivisaSeleccionada] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const navigate = useNavigate();
    const location = useLocation();
    const { total } = location.state || {};
    
    // Estados para los campos simulados
    const [cardNumber, setCardNumber] = useState('');
    const [cardName, setCardName] = useState('');
    const [expiryDate, setExpiryDate] = useState('');
    const [cvv, setCvv] = useState('');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [formErrors, setFormErrors] = useState({});
    const [isFormValid, setIsFormValid] = useState(false);

    const token = localStorage.getItem('token');

    // Validación de campos en tiempo real
    useEffect(() => {
        const errors = {};
        
        if (metodoPago === 'Tarjeta de Crédito') {
            if (!cardNumber.match(/^\d{16}$/)) errors.cardNumber = 'Número de tarjeta inválido';
            if (!cardName.trim()) errors.cardName = 'Nombre en tarjeta requerido';
            if (!expiryDate.match(/^(0[1-9]|1[0-2])\/?([0-9]{2})$/)) errors.expiryDate = 'Fecha inválida (MM/YY)';
            if (!cvv.match(/^\d{3,4}$/)) errors.cvv = 'CVV inválido';
        }
        
        if (metodoPago === 'PayPal' && !email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
            errors.email = 'Email inválido';
        }
        
        if (metodoPago === 'Nequi' && !phone.match(/^\d{10}$/)) {
            errors.phone = 'Teléfono inválido (10 dígitos)';
        }
        
        if (metodoPago === 'PSE' && !email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
            errors.email = 'Email inválido';
        }
        
        setFormErrors(errors);
        setIsFormValid(Object.keys(errors).length === 0);
    }, [cardNumber, cardName, expiryDate, cvv, email, phone, metodoPago]);

    // Obtener las divisas disponibles
    useEffect(() => {
        const obtenerDivisas = async () => {
            try {
                const response = await axios.get('http://localhost:5000/divisas', {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                });
                
                if (response.data && response.data.length > 0) {
                    setDivisas(response.data);
                    setDivisaSeleccionada(response.data[0].id);
                } else {
                    setError('No hay divisas disponibles');
                }
            } catch (err) {
                setError(err.response?.data?.mensaje || 'Error al cargar divisas');
                if (err.response?.status === 401) {
                    navigate('/login');
                }
            } finally {
                setLoading(false);
            }
        };

        obtenerDivisas();
    }, [token, navigate]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        // Solo validamos los campos simulados, pero no los enviamos
        if (metodoPago !== 'Nequi' && !isFormValid) {
            setError('Por favor complete correctamente todos los campos');
            return;
        }
        
        setLoading(true);
        
        try {
            const response = await axios.post(
                'http://localhost:5000/generar-factura',
                {
                    metodo_pago: metodoPago,
                    divisa_id: divisaSeleccionada,
                    monto_total: total
                },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                }
            );

            navigate(`/factura/${response.data.factura_id}`);
        } catch (err) {
            setError(err.response?.data?.mensaje || 'Error al procesar el pago');
            console.error('Error:', err.response?.data);
        } finally {
            setLoading(false);
        }
    };

    // Formatear número de tarjeta para mostrar como XXXX XXXX XXXX XXXX
    const formatCardNumber = (value) => {
        const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
        const matches = v.match(/\d{4,16}/g);
        const match = matches && matches[0] || '';
        const parts = [];
        
        for (let i = 0, len = match.length; i < len; i += 4) {
            parts.push(match.substring(i, i + 4));
        }
        
        if (parts.length) {
            return parts.join(' ');
        } else {
            return value;
        }
    };

    // Formatear fecha de expiración (MM/YY)
    const formatExpiryDate = (value) => {
        const v = value.replace(/\D/g, '');
        if (v.length >= 3) {
            return `${v.slice(0, 2)}/${v.slice(2, 4)}`;
        }
        return value;
    };

    if (loading) return (
        <div className="loading-container">
            <div class="loader">
            <svg viewBox="0 0 80 80">
                <circle r="32" cy="40" cx="40" id="test"></circle>
            </svg>
            </div>

            <div class="loader triangle">
            <svg viewBox="0 0 86 80">
                <polygon points="43 8 79 72 7 72"></polygon>
            </svg>
            </div>

            <div class="loader">
            <svg viewBox="0 0 80 80">
                <rect height="64" width="64" y="8" x="8"></rect>
            </svg>
            </div>

            <p>Cargando métodos de pago...</p>
        </div>
    );

    if (error) return (
        <div className="error-container">
            <h3>Error</h3>
            <p>{error}</p>
            <button 
                onClick={() => window.location.reload()}
                className="retry-btn"
            >
                Reintentar
            </button>
        </div>
    );

    return (
        <div className="payment-container">
            <h2>Finalizar Compra</h2>
            
            {total && (
                <div className="total-container">
                    <p>
                        Total a pagar: <span>${total.toLocaleString()}</span>
                    </p>
                </div>
            )}
            
            <form onSubmit={handleSubmit} className="payment-form">
                <div className="form-group">
                    <label>Método de Pago:</label>
                    <select 
                        value={metodoPago}
                        onChange={(e) => setMetodoPago(e.target.value)}
                        className="form-control"
                        required
                    >
                        <option value="Nequi">Nequi</option>
                        <option value="Tarjeta de Crédito">Tarjeta de Crédito</option>
                        <option value="PayPal">PayPal</option>
                        <option value="PSE">PSE</option>
                    </select>
                </div>

                {/* Campos condicionales según método de pago */}
                {metodoPago === 'Tarjeta de Crédito' && (
                    <>
                        <div className="form-group">
                            <label>Número de Tarjeta</label>
                            <input
                                type="text"
                                value={formatCardNumber(cardNumber)}
                                onChange={(e) => setCardNumber(e.target.value.replace(/\s/g, ''))}
                                placeholder="1234 5678 9012 3456"
                                maxLength="19"
                                className={`form-control ${formErrors.cardNumber ? 'is-invalid' : ''}`}
                            />
                            {formErrors.cardNumber && <div className="error-message">{formErrors.cardNumber}</div>}
                        </div>

                        <div className="form-group">
                            <label>Nombre en la Tarjeta</label>
                            <input
                                type="text"
                                value={cardName}
                                onChange={(e) => setCardName(e.target.value)}
                                placeholder="JUAN PEREZ"
                                className={`form-control ${formErrors.cardName ? 'is-invalid' : ''}`}
                            />
                            {formErrors.cardName && <div className="error-message">{formErrors.cardName}</div>}
                        </div>

                        <div className="form-row">
                            <div className="form-group">
                                <label>Fecha Expiración</label>
                                <input
                                    type="text"
                                    value={formatExpiryDate(expiryDate)}
                                    onChange={(e) => setExpiryDate(e.target.value.replace(/\D/g, ''))}
                                    placeholder="MM/YY"
                                    maxLength="5"
                                    className={`form-control ${formErrors.expiryDate ? 'is-invalid' : ''}`}
                                />
                                {formErrors.expiryDate && <div className="error-message">{formErrors.expiryDate}</div>}
                            </div>

                            <div className="form-group">
                                <label>CVV</label>
                                <input
                                    type="text"
                                    value={cvv}
                                    onChange={(e) => setCvv(e.target.value.replace(/\D/g, ''))}
                                    placeholder="123"
                                    maxLength="4"
                                    className={`form-control ${formErrors.cvv ? 'is-invalid' : ''}`}
                                />
                                {formErrors.cvv && <div className="error-message">{formErrors.cvv}</div>}
                            </div>
                        </div>
                    </>
                )}

                {(metodoPago === 'PayPal' || metodoPago === 'PSE') && (
                    <div className="form-group">
                        <label>Correo Electrónico</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="tu@email.com"
                            className={`form-control ${formErrors.email ? 'is-invalid' : ''}`}
                        />
                        {formErrors.email && <div className="error-message">{formErrors.email}</div>}
                    </div>
                )}

                {metodoPago === 'Nequi' && (
                    <div className="form-group">
                        <label>Número de Teléfono</label>
                        <input
                            type="text"
                            value={phone}
                            onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                            placeholder="3001234567"
                            maxLength="10"
                            className={`form-control ${formErrors.phone ? 'is-invalid' : ''}`}
                        />
                        {formErrors.phone && <div className="error-message">{formErrors.phone}</div>}
                    </div>
                )}

                <div className="form-group">
                    <label>Divisa:</label>
                    <select
                        value={divisaSeleccionada}
                        onChange={(e) => setDivisaSeleccionada(e.target.value)}
                        className="form-control"
                        required
                    >
                        {divisas.map(divisa => (
                            <option key={divisa.id} value={divisa.id}>
                                {divisa.nombre} ({divisa.simbolo}) - TC: {divisa.tipo_cambio}
                            </option>
                        ))}
                    </select>
                </div>

                <button 
                    type="submit" 
                    disabled={loading || (metodoPago !== 'Nequi' && !isFormValid)}
                    className={`submit-btn ${loading || (metodoPago !== 'Nequi' && !isFormValid) ? 'disabled' : ''}`}
                >
                    {loading ? (
                        <span className="btn-loading">
                            <div className="loader small">
                                <svg viewBox="0 0 80 80">
                                    <rect height="20" width="20" y="30" x="30"></rect>
                                </svg>
                            </div>
                            Procesando...
                        </span>
                    ) : 'Confirmar Pago'}
                </button>
            </form>
            
            {/* Nota sobre seguridad */}
            <div className="security-note">
                <span className="security-icon">🔒</span>
                <p>Todos los pagos son procesados de forma segura. No almacenamos información de tarjetas de crédito.</p>
            </div>
        </div>
    );
};

export default FormaPago;