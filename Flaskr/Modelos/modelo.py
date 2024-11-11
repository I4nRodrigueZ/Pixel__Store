from flask_sqlalchemy import SQLAlchemy
import enum


db = SQLAlchemy()

# Modelo de Rol
class RolEnum(enum.Enum):
    ADMIN = "Admin"
    CLIENTE = "Cliente"
    VENDEDOR = "Vendedor"
#Modelo Usuario
class Usuario(db.Model):
    __tablename__ = 'usuario'
    id_usuario = db.Column(db.Integer, primary_key=True, autoincrement=True)
    nombre = db.Column(db.String(50), nullable=False)
    apellido = db.Column(db.String(50), nullable=False)
    email = db.Column(db.String(100), unique=True, nullable=False)
    contraseña = db.Column(db.String(100), nullable=False)
    fecha_registro = db.Column(db.Date, nullable=False)
    direccion = db.Column(db.String(150))
    telefono = db.Column(db.String(20))
    rol = db.Column(db.Enum(RolEnum), nullable=False) 

    # Relaciones
    carrito = db.relationship('Carrito', backref='usuario', uselist=False)
    facturas = db.relationship('Factura', backref='usuario', lazy=True)
    reseñas = db.relationship('Resena', backref='usuario', lazy=True)
    logs = db.relationship('Log', backref='usuario', lazy=True)

# Modelo de Carrito
class Carrito(db.Model):
    __tablename__ = 'carrito'
    id_carrito = db.Column(db.Integer, primary_key=True, autoincrement=True)
    id_usuario = db.Column(db.Integer, db.ForeignKey('usuario.id_usuario', ondelete='CASCADE'))
    fecha_creacion = db.Column(db.Date, nullable=False)

# Modelo de Divisas
class Divisa(db.Model):
    __tablename__ = 'divisas'
    id_divisa = db.Column(db.Integer, primary_key=True, autoincrement=True)
    nombre_divisa = db.Column(db.String(50), nullable=False)
    simbolo = db.Column(db.String(10))
    tipo_cambio = db.Column(db.Numeric(10, 4), nullable=False)

# Modelo de Factura
class Factura(db.Model):
    __tablename__ = 'factura'
    id_factura = db.Column(db.Integer, primary_key=True, autoincrement=True)
    id_usuario = db.Column(db.Integer, db.ForeignKey('usuario.id_usuario', ondelete='SET NULL'))
    fecha_factura = db.Column(db.Date, nullable=False)
    monto_total = db.Column(db.Numeric(10, 2), nullable=False)
    impuestos = db.Column(db.Numeric(10, 2), default=0)
    total_factura = db.Column(db.Numeric(10, 2), nullable=False)
    metodo_pago = db.Column(db.String(50), nullable=False)
    id_divisa = db.Column(db.Integer, db.ForeignKey('divisas.id_divisa', ondelete='SET NULL'))

# Modelo de Categoría
class Categoria(db.Model):
    __tablename__ = 'categoria'
    id_categoria = db.Column(db.Integer, primary_key=True, autoincrement=True)
    nombre_categoria = db.Column(db.String(50), nullable=False)
    descripcion = db.Column(db.Text)

# Modelo de Juegos
class Juego(db.Model):
    __tablename__ = 'juegos'
    id_juego = db.Column(db.Integer, primary_key=True, autoincrement=True)
    nombre_juego = db.Column(db.String(100), nullable=False)
    descripcion = db.Column(db.Text)
    precio = db.Column(db.Numeric(10, 2), nullable=False)
    stock = db.Column(db.Integer, default=0)
    condicion = db.Column(db.Enum('Nuevo', 'Usado'), nullable=False)
    id_categoria = db.Column(db.Integer, db.ForeignKey('categoria.id_categoria', ondelete='SET NULL'))

# Modelo de Detalle Factura
class DetalleFactura(db.Model):
    __tablename__ = 'detalle_factura'
    id_factura = db.Column(db.Integer, db.ForeignKey('factura.id_factura', ondelete='CASCADE'), primary_key=True)
    id_juego = db.Column(db.Integer, db.ForeignKey('juegos.id_juego', ondelete='CASCADE'), primary_key=True)
    cantidad = db.Column(db.Integer, nullable=False)
    precio_unitario = db.Column(db.Numeric(10, 2), nullable=False)

# Modelo de Reseña
class Resena(db.Model):
    __tablename__ = 'resena'
    id_resena = db.Column(db.Integer, primary_key=True, autoincrement=True)
    id_juego = db.Column(db.Integer, db.ForeignKey('juegos.id_juego', ondelete='CASCADE'))
    id_usuario = db.Column(db.Integer, db.ForeignKey('usuario.id_usuario', ondelete='SET NULL'))
    calificacion = db.Column(db.Integer, nullable=False)
    comentario = db.Column(db.Text)
    fecha_resena = db.Column(db.Date, nullable=False)

# Modelo de Promociones
class Promocion(db.Model):
    __tablename__ = 'promocion'
    id_promocion = db.Column(db.Integer, primary_key=True, autoincrement=True)
    nombre_promocion = db.Column(db.String(100), nullable=False)
    tipo_descuento = db.Column(db.Enum('Porcentaje', 'Fijo'), nullable=False)
    valor_descuento = db.Column(db.Numeric(5, 2), nullable=False)
    fecha_inicio = db.Column(db.Date, nullable=False)
    fecha_fin = db.Column(db.Date, nullable=False)

# Modelo de Juegos Promociones (N a M)
class JuegosPromociones(db.Model):
    __tablename__ = 'juegos_promociones'
    id_juego = db.Column(db.Integer, db.ForeignKey('juegos.id_juego', ondelete='CASCADE'), primary_key=True)
    id_promocion = db.Column(db.Integer, db.ForeignKey('promocion.id_promocion', ondelete='CASCADE'), primary_key=True)

# Modelo de Métodos de Pago
class MetodoPago(db.Model):
    __tablename__ = 'metodo_pago'
    id_metodo = db.Column(db.Integer, primary_key=True, autoincrement=True)
    nombre_metodo = db.Column(db.String(50), nullable=False)

# Modelo de Historial de Precio
class HistorialPrecio(db.Model):
    __tablename__ = 'historial_precio'
    id_historial = db.Column(db.Integer, primary_key=True, autoincrement=True)
    id_juego = db.Column(db.Integer, db.ForeignKey('juegos.id_juego', ondelete='CASCADE'))
    precio = db.Column(db.Numeric(10, 2), nullable=False)
    fecha_cambio = db.Column(db.Date, nullable=False)

# Modelo de Logs
class Log(db.Model):
    __tablename__ = 'logs'
    id_log = db.Column(db.Integer, primary_key=True, autoincrement=True)
    id_usuario = db.Column(db.Integer, db.ForeignKey('usuario.id_usuario', ondelete='SET NULL'))
    accion = db.Column(db.String(255), nullable=False)
    fecha_hora = db.Column(db.DateTime, default=db.func.current_timestamp())
    detalles = db.Column(db.Text)
