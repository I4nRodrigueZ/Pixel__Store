import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import axios from 'axios'
import "./DetalleFactura.css";
// ... imports igual

// ... imports igual

const DetalleFactura = () => {
  const { id_factura } = useParams()
  const [factura, setFactura] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const navigate = useNavigate()

  useEffect(() => {
    const obtenerFactura = async () => {
      try {
        const token = localStorage.getItem('token')
        const response = await axios.get(`http://localhost:5000/factura/${id_factura}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })

        const facturaTransformada = {
          id: response.data.id,
          fecha: new Date(response.data.fecha).toLocaleString(),
          metodo_pago: response.data.metodo_pago,
          subtotal: response.data.subtotal || 0,
          impuestos: response.data.impuestos || 0,
          total: response.data.total || 0,
          divisa: response.data.divisa || 'No disponible',
          juegos: (response.data.detalles || []).map(detalle => ({
            titulo: detalle.juego?.nombre || 'Producto sin nombre',
            cantidad: detalle.cantidad || 1,
            precio_unitario: detalle.juego?.precio_con_descuento || 0,
            precio_original: detalle.juego?.precio_original || 0,
          }))
        }

        setFactura(facturaTransformada)
      } catch (error) {
        setError(error.response?.data?.mensaje || 'Error al cargar la factura')
      } finally {
        setLoading(false)
      }
    }

    obtenerFactura()
  }, [id_factura, navigate])

  if (loading) {
    return (
      <div className="detalle-factura-container text-center">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-yellow-600"></div>
        <p className="mt-2 text-yellow-200">Cargando factura...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="detalle-factura-container text-center">
        <h3 className="text-red-400 font-bold">Error</h3>
        <p className="text-red-300">{error}</p>
        <button
          onClick={() => navigate('/')}
          className="volver-btn mt-4"
        >
          Volver a la tienda
        </button>
      </div>
    )
  }

  if (!factura) {
    return <div className="detalle-factura-container text-center">No se encontró la factura</div>
  }

  return (
    <div className="detalle-factura-container">
      <h1 className="text-2xl font-bold mb-6">
        Factura #{factura.id}
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div>
          <p><strong>Fecha:</strong> {factura.fecha}</p>
          <p><strong>Método de pago:</strong> {factura.metodo_pago}</p>
        </div>
        <div>
          <p><strong>Divisa:</strong> {factura.divisa}</p>
        </div>
      </div>

      <h2 className="text-xl font-semibold mb-4">Detalles de compra</h2>
      <ul className="space-y-3">
        {factura.juegos.map((juego, index) => (
          <li key={index} className="factura-item">
            <div className="flex items-start">
              <span className="text-2xl mr-3">🎮</span>
              <div className="flex-1">
                <h3 className="font-medium">{juego.titulo}</h3>
                <div className="grid grid-cols-2 gap-2 mt-2 text-sm">
                  <span>Cantidad: {juego.cantidad}</span>
                  <span className="text-right">
                    Precio original: 
                    <span className="line-through text-gray-500">
                      {factura.divisa === 'No disponible' ? '$' : factura.divisa} {juego.precio_original.toFixed(2)}
                    </span>
                    <br />
                    Precio con descuento: {factura.divisa === 'No disponible' ? '$' : factura.divisa} {juego.precio_unitario.toFixed(2)}
                  </span>
                </div>
              </div>
            </div>
          </li>
        ))}
      </ul>

      <div className="mt-6 pt-4 space-y-2">
        <div className="flex justify-between">
          <span>Subtotal:</span>
          <span>{factura.divisa === 'No disponible' ? '$' : factura.divisa} {factura.subtotal.toFixed(2)}</span>
        </div>
        <div className="flex justify-between">
          <span>Impuestos:</span>
          <span>{factura.divisa === 'No disponible' ? '$' : factura.divisa} {factura.impuestos.toFixed(2)}</span>
        </div>
        <div className="flex justify-between font-bold text-lg mt-2">
          <span>Total:</span>
          <span className="text-blue-600">
            {factura.divisa === 'No disponible' ? '$' : factura.divisa} {factura.total.toFixed(2)}
          </span>
        </div>
      </div>

      <div className="mt-8 text-center">
        <button
          onClick={() => navigate('/')}
          className="volver-btn"
        >
          Volver a la tienda
        </button>
      </div>
    </div>
  )
}

export default DetalleFactura

