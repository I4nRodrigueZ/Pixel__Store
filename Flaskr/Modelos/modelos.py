from datetime import datetime
from flask_sqlalchemy import SQLAlchemy
from marshmallow_sqlalchemy import SQLAlchemyAutoSchema
from marshmallow import fields
from werkzeug.security import generate_password_hash, check_password_hash
import enum

db = SQLAlchemy()

# Enumeraciones
class RolUsuario(enum.Enum):
    ADMIN = "admin"
    USUARIO = "usuario"
    VENDEDOR = "vendedor"

# Tablas relacionales
detalle_factura = db.Table('detalle_factura',
    db.Column('factura_id', db.Integer, db.ForeignKey('factura.id'), primary_key=True),
    db.Column('juego_id', db.Integer, db.ForeignKey('juego.id'), primary_key=True)
)

# Tabla intermedia para la relación entre Carrito y Juego
detalle_carrito = db.Table('detalle_carrito',
    db.Column('carrito_id', db.Integer, db.ForeignKey('carrito.id'), primary_key=True),
    db.Column('juego_id', db.Integer, db.ForeignKey('juego.id'), primary_key=True)
)

juegos_promociones = db.Table('juegos_promociones',
    db.Column('juego_id', db.Integer, db.ForeignKey('juego.id'), primary_key=True),
    db.Column('promocion_id', db.Integer, db.ForeignKey('promocion.id'), primary_key=True)
)

# Modelos
class Usuario(db.Model):
    __tablename__ = 'usuario'
    
    id = db.Column(db.Integer, primary_key=True)
    nombre = db.Column(db.String(50), unique=False, nullable=False)
    apellido = db.Column(db.String(50), nullable=False)  
    email = db.Column(db.String(100), unique=True, nullable=False)
    contrasena_hash = db.Column(db.String(255), nullable=False)
    rol = db.Column(db.Enum(RolUsuario), default=RolUsuario.USUARIO, nullable=False)
    fecha_registro = db.Column(db.Date, default=datetime.utcnow, nullable=False)  
    direccion = db.Column(db.String(150), nullable=True)  
    telefono = db.Column(db.String(20), nullable=True)  

    facturas = db.relationship('Factura', back_populates='usuario', cascade='all, delete-orphan')
    carrito = db.relationship('Carrito', back_populates='usuario', uselist=False, cascade='all, delete-orphan')
    resenas = db.relationship('Resena', back_populates='usuario', lazy=True)
    logs = db.relationship('Log', back_populates='usuario', lazy=True)

    @property
    def contrasena(self):
        raise AttributeError("La contraseña no es un atributo legible.")

    @contrasena.setter
    def contrasena(self, password):
        self.contrasena_hash = generate_password_hash(password)

    def verificar_contrasena(self, password):
        return check_password_hash(self.contrasena_hash, password)

class Juego(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    titulo = db.Column(db.String(100), nullable=False)
    precio = db.Column(db.Float, nullable=False)
    stock = db.Column(db.Integer, default=0, nullable=False)
    categoria_id = db.Column(db.Integer, db.ForeignKey('categoria.id'), nullable=False)
    categoria = db.relationship('Categoria', back_populates='juegos')
    facturas = db.relationship('Factura', secondary=detalle_factura, back_populates='juegos')
    carritos = db.relationship('Carrito', secondary=detalle_carrito, back_populates='juegos')
    resenas = db.relationship('Resena', back_populates='juego')  
    promociones = db.relationship('Promocion', secondary='juegos_promociones', back_populates='juegos')

class Categoria(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    nombre = db.Column(db.String(100), unique=True, nullable=False)
    juegos = db.relationship('Juego', back_populates='categoria', cascade='all, delete-orphan')

class Factura(db.Model):
    __tablename__ = 'factura'
    
    id = db.Column(db.Integer, primary_key=True)
    fecha = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)
    monto_subtotal = db.Column(db.Float, nullable=False)  
    impuestos = db.Column(db.Float, nullable=False)  
    total = db.Column(db.Float, nullable=False)  
    metodo_pago = db.Column(db.String(50), nullable=False)  
    divisa_id = db.Column(db.Integer, db.ForeignKey('divisas.id'), nullable=False)
    
    usuario_id = db.Column(db.Integer, db.ForeignKey('usuario.id'), nullable=False)  
    usuario = db.relationship('Usuario', back_populates='facturas')  

    juegos = db.relationship('Juego', secondary=detalle_factura, back_populates='facturas')  
    divisa = db.relationship('Divisa', back_populates='facturas')  

class Carrito(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    usuario_id = db.Column(db.Integer, db.ForeignKey('usuario.id'), nullable=False)
    usuario = db.relationship('Usuario', back_populates='carrito')
    juegos = db.relationship('Juego', secondary=detalle_carrito, back_populates='carritos')
    total = db.Column(db.Float, nullable=False, default=0.0)

    def calcular_total(self):
        self.total = sum(juego.precio for juego in self.juegos)
        db.session.commit()

class Divisa(db.Model):
    __tablename__ = 'divisas'

    id = db.Column(db.Integer, primary_key=True)  
    nombre = db.Column(db.String(50), nullable=False)  
    simbolo = db.Column(db.String(10), nullable=False)  
    tipo_cambio = db.Column(db.Numeric(10, 4), nullable=False)  

    facturas = db.relationship('Factura', back_populates='divisa', cascade='all, delete-orphan')

class Resena(db.Model):
    __tablename__ = 'resena'

    id = db.Column(db.Integer, primary_key=True)
    juego_id = db.Column(db.Integer, db.ForeignKey('juego.id'), nullable=False)
    usuario_id = db.Column(db.Integer, db.ForeignKey('usuario.id'), nullable=False)
    calificacion = db.Column(db.Integer, nullable=False)  
    comentario = db.Column(db.Text, nullable=True)  
    fecha = db.Column(db.Date, nullable=False)

    juego = db.relationship('Juego', back_populates='resenas')
    usuario = db.relationship('Usuario', back_populates='resenas')

class Promocion(db.Model):
    __tablename__ = 'promocion'

    id = db.Column(db.Integer, primary_key=True)
    nombre = db.Column(db.String(100), nullable=False)
    tipo_descuento = db.Column(db.Enum('Porcentaje', 'Monto_Fijo', name='tipo_descuento_enum'), nullable=False)
    valor_descuento = db.Column(db.Numeric(5, 2), nullable=False)
    fecha_inicio = db.Column(db.Date, nullable=False)
    fecha_fin = db.Column(db.Date, nullable=False)

    juegos = db.relationship('Juego', secondary='juegos_promociones', back_populates='promociones')

class Log(db.Model):
    __tablename__ = 'logs'

    id = db.Column(db.Integer, primary_key=True)
    usuario_id = db.Column(db.Integer, db.ForeignKey('usuario.id'), nullable=False)
    accion = db.Column(db.String(200), nullable=False)
    fecha_hora = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)
    detalles = db.Column(db.Text, nullable=True)

    usuario = db.relationship('Usuario', back_populates='logs')

# Serializadores
class EnumADiccionario(fields.Field):
    def _serialize(self, value, attr, obj, **kwargs):
        if value is None:
            return None
        return {"llave": value.name, "valor": value.value}

class UsuarioSchema(SQLAlchemyAutoSchema):
    rol = EnumADiccionario(attribute="rol")
    class Meta:
        model = Usuario
        include_relationships = True
        load_instance = True
        exclude = ("contrasena_hash",)

class JuegoSchema(SQLAlchemyAutoSchema):
    class Meta:
        model = Juego
        include_relationships = True
        load_instance = True

class CategoriaSchema(SQLAlchemyAutoSchema):
    class Meta:
        model = Categoria
        include_relationships = True
        load_instance = True

class FacturaSchema(SQLAlchemyAutoSchema):
    class Meta:
        model = Factura
        include_relationships = True
        load_instance = True

class CarritoSchema(SQLAlchemyAutoSchema):
    class Meta:
        model = Carrito
        include_relationships = True
        load_instance = True

class DivisaSchema(SQLAlchemyAutoSchema):
    class Meta:
        model = Divisa
        include_relationships = True
        load_instance = True

class ResenaSchema(SQLAlchemyAutoSchema):
    class Meta:
        model = Resena
        include_relationships = True
        load_instance = True

class PromocionSchema(SQLAlchemyAutoSchema):
    class Meta:
        model = Promocion
        include_relationships = True
        load_instance = True

class LogSchema(SQLAlchemyAutoSchema):
    class Meta:
        model = Log
        include_relationships = True
        load_instance = True
