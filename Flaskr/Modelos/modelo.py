from flask_sqlalchemy import SQLAlchemy  # Importamos SQLAlchemy para manejar la base de datos
import enum  # Importamos la biblioteca enum para definir enumeraciones

# Inicializamos la instancia de SQLAlchemy
db = SQLAlchemy()

# Definimos una enumeración para los roles de usuario
class RolEnum(enum.Enum):
    ADMINISTRADOR = "Administrador"  # Primer valor del enum
    CLIENTE = "Cliente"  # Segundo valor del enum
    VENDEDOR = "Vendedor"  # Tercer valor del enum

# Definimos el modelo de Usuario
class Usuario(db.Model):
    __tablename__ = 'usuario'  # Nombre de la tabla en la base de datos
    id_usuario = db.Column(db.Integer, primary_key=True, autoincrement=True)  # Clave primaria con auto-incremento
    nombre = db.Column(db.String(50), nullable=False)  # Campo obligatorio para el nombre
    apellido = db.Column(db.String(50), nullable=False)  # Campo obligatorio para el apellido
    email = db.Column(db.String(100), unique=True, nullable=False)  # Campo único y obligatorio para el email
    contraseña = db.Column(db.String(100), nullable=False)  # Campo obligatorio para la contraseña
    fecha_registro = db.Column(db.Date, nullable=False)  # Campo obligatorio para la fecha de registro
    direccion = db.Column(db.String(150))  # Campo opcional para la dirección
    telefono = db.Column(db.String(20))  # Campo opcional para el teléfono
    nombre_rol = db.Column(db.Enum(RolEnum), nullable=False)  # Campo de tipo enum para el rol, obligatorio

    # Relación uno a muchos con Factura
    facturas = db.relationship('Factura', backref='usuario', lazy=True)
    # Relación uno a uno con Carrito
    carrito = db.relationship('Carrito', uselist=False, backref='usuario')
    # Relación uno a muchos con Reseña
    reseñas = db.relationship('Resena', backref='usuario', lazy=True)
    # Relación uno a muchos con Log
    logs = db.relationship('Log', backref='usuario', lazy=True)

# Definimos el modelo de Carrito
class Carrito(db.Model):
    __tablename__ = 'carrito'  # Nombre de la tabla en la base de datos
    id_carrito = db.Column(db.Integer, primary_key=True, autoincrement=True)  # Clave primaria con auto-incremento
    id_usuario = db.Column(db.Integer, db.ForeignKey('usuario.id_usuario', ondelete='CASCADE'))  # Clave foránea a Usuario
    fecha_creacion = db.Column(db.Date, nullable=False)  # Campo obligatorio para la fecha de creación

# Definimos el modelo de Divisa
class Divisa(db.Model):
    __tablename__ = 'divisas'  # Nombre de la tabla en la base de datos
    id_divisa = db.Column(db.Integer, primary_key=True, autoincrement=True)  # Clave primaria con auto-incremento
    nombre_divisa = db.Column(db.String(50), nullable=False)  # Campo obligatorio para el nombre de la divisa
    simbolo = db.Column(db.String(10))  # Campo opcional para el símbolo
    tipo_cambio = db.Column(db.Numeric(10, 4), nullable=False)  # Campo obligatorio para el tipo de cambio

# Definimos el modelo de Factura
class Factura(db.Model):
    __tablename__ = 'factura'  # Nombre de la tabla en la base de datos
    id_factura = db.Column(db.Integer, primary_key=True, autoincrement=True)  # Clave primaria con auto-incremento
    id_usuario = db.Column(db.Integer, db.ForeignKey('usuario.id_usuario', ondelete='SET NULL'))  # Clave foránea a Usuario
    fecha_factura = db.Column(db.Date, nullable=False)  # Campo obligatorio para la fecha de la factura
    monto_total = db.Column(db.Numeric(10, 2), nullable=False)  # Campo obligatorio para el monto total
    impuestos = db.Column(db.Numeric(10, 2), default=0)  # Campo con valor por defecto para los impuestos
    total_factura = db.Column(db.Numeric(10, 2), nullable=False)  # Campo obligatorio para el total de la factura
    metodo_pago = db.Column(db.String(50), nullable=False)  # Campo obligatorio para el método de pago
    id_divisa = db.Column(db.Integer, db.ForeignKey('divisas.id_divisa', ondelete='SET NULL'))  # Clave foránea a Divisa

# Definimos el modelo de Categoría
class Categoria(db.Model):
    __tablename__ = 'categoria'  # Nombre de la tabla en la base de datos
    id_categoria = db.Column(db.Integer, primary_key=True, autoincrement=True)  # Clave primaria con auto-incremento
    nombre_categoria = db.Column(db.String(50), nullable=False)  # Campo obligatorio para el nombre de la categoría
    descripcion = db.Column(db.Text)  # Campo opcional para la descripción

# Definimos el modelo de Juegos
class Juego(db.Model):
    __tablename__ = 'juegos'  # Nombre de la tabla en la base de datos
    id_juego = db.Column(db.Integer, primary_key=True, autoincrement=True)  # Clave primaria con auto-incremento
    nombre_juego = db.Column(db.String(100), nullable=False)  # Campo obligatorio para el nombre del juego
    descripcion = db.Column(db.Text)  # Campo opcional para la descripción
    precio = db.Column(db.Numeric(10, 2), nullable=False)  # Campo obligatorio para el precio
    stock = db.Column(db.Integer, default=0)  # Campo opcional con valor por defecto para el stock
    condicion = db.Column(db.Enum('Nuevo', 'Usado'), nullable=False)  # Campo enum para la condición del juego
    id_categoria = db.Column(db.Integer, db.ForeignKey('categoria.id_categoria', ondelete='SET NULL'))  # Clave foránea a Categoría

# Definimos el modelo de DetalleFactura
class DetalleFactura(db.Model):
    __tablename__ = 'detalle_factura'  # Nombre de la tabla en la base de datos
    id_factura = db.Column(db.Integer, db.ForeignKey('factura.id_factura', ondelete='CASCADE'), primary_key=True)  # Clave primaria compuesta y foránea a Factura
    id_juego = db.Column(db.Integer, db.ForeignKey('juegos.id_juego', ondelete='CASCADE'), primary_key=True)  # Clave primaria compuesta y foránea a Juegos
    cantidad = db.Column(db.Integer, nullable=False)  # Campo obligatorio para la cantidad
    precio_unitario = db.Column(db.Numeric(10, 2), nullable=False)  # Campo obligatorio para el precio unitario

# Definimos el modelo de Reseña
class Resena(db.Model):
    __tablename__ = 'resena'  # Nombre de la tabla en la base de datos
    id_resena = db.Column(db.Integer, primary_key=True, autoincrement=True)  # Clave primaria con auto-incremento
    id_juego = db.Column(db.Integer, db.ForeignKey('juegos.id_juego', ondelete='CASCADE'))  # Clave foránea a Juegos
    id_usuario = db.Column(db.Integer, db.ForeignKey('usuario.id_usuario', ondelete='SET NULL'))  # Clave foránea a Usuario
    calificacion = db.Column(db.Integer, nullable=False)  # Campo obligatorio para la calificación
    comentario = db.Column(db.Text)  # Campo opcional para el comentario
    fecha_resena = db.Column(db.Date, nullable=False)  # Campo obligatorio para la fecha de la reseña

# Definimos el modelo de Promociones
class Promocion(db.Model):
    __tablename__ = 'promocion'  # Nombre de la tabla en la base de datos
    id_promocion = db.Column(db.Integer, primary_key=True, autoincrement=True)  # Clave primaria con auto-incremento
    nombre_promocion = db.Column(db.String(100), nullable=False)  # Campo obligatorio para el nombre de la promoción
    tipo_descuento = db.Column(db.Enum('Porcentaje', 'Fijo'), nullable=False)  # Campo enum para el tipo de descuento
    valor_descuento = db.Column(db.Numeric(5, 2), nullable=False)  # Campo obligatorio para el valor del descuento
    fecha_inicio = db.Column(db.Date, nullable=False)  # Campo obligatorio para la fecha de inicio
    fecha_fin = db.Column(db.Date, nullable=False)  # Campo obligatorio para la fecha de fin

# Definimos el modelo de JuegosPromociones (relación N a M)
class JuegosPromociones(db.Model):
    __tablename__ = 'juegos_promociones'  # Nombre de la tabla en la base de datos
    id_juego = db.Column(db.Integer, db.ForeignKey('juegos.id_juego', ondelete='CASCADE'), primary_key=True)  # Clave primaria compuesta y foránea a Juegos
    id_promocion = db.Column(db.Integer, db.ForeignKey('promocion.id_promocion', ondelete='CASCADE'), primary_key=True)  # Clave primaria compuesta y foránea a Promocion

# Definimos el modelo de MetodoPago
class MetodoPago(db.Model):
    __tablename__ = 'metodo_pago'  # Nombre de la tabla en la base de datos
    id_metodo = db.Column(db.Integer, primary_key=True, autoincrement=True)  # Clave primaria con auto-incremento
    nombre_metodo = db.Column(db.String(50), nullable=False)  # Campo obligatorio para el nombre del método

# Definimos el modelo de HistorialPrecio
class HistorialPrecio(db.Model):
    __tablename__ = 'historial_precio'  # Nombre de la tabla en la base de datos
    id_historial = db.Column(db.Integer, primary_key=True, autoincrement=True)  # Clave primaria con auto-incremento
    id_juego = db.Column(db.Integer, db.ForeignKey('juegos.id_juego', ondelete='CASCADE'))  # Clave foránea a Juegos
    precio = db.Column(db.Numeric(10, 2), nullable=False)  # Campo obligatorio para el precio
    fecha_cambio = db.Column(db.Date, nullable=False)  # Campo obligatorio para la fecha del cambio de precio

# Definimos el modelo de Log
class Log(db.Model):
    __tablename__ = 'logs'  # Nombre de la tabla en la base de datos
    id_log = db.Column(db.Integer, primary_key=True, autoincrement=True)  # Clave primaria con auto-incremento
    id_usuario = db.Column(db.Integer, db.ForeignKey('usuario.id_usuario', ondelete='SET NULL'))  # Clave foránea a Usuario
    accion = db.Column(db.String(255), nullable=False)  # Campo obligatorio para la acción
    fecha_hora = db.Column(db.DateTime, default=db.func.current_timestamp())  # Campo con valor por defecto para la fecha y hora
    detalles = db.Column(db.Text)  # Campo opcional para detalles adicionales
