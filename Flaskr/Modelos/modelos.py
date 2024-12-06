<<<<<<< HEAD
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

=======
from flask_sqlalchemy import SQLAlchemy
import enum
from marshmallow import fields
from marshmallow_sqlalchemy import SQLAlchemyAutoSchema

# Inicialización de la base de datos
db = SQLAlchemy()

# Definición de los enums
class RolEnum(enum.Enum):
    ADMINISTRADOR = "Administrador"
    CLIENTE = "Cliente"
    VENDEDOR = "Vendedor"

# Modelos de la base de datos


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

    def to_dict(self):
        return {
            "id_factura": self.id_factura,
            "id_usuario": self.id_usuario,
            "fecha_factura": self.fecha_factura.isoformat() if self.fecha_factura else None,
            "monto_total": str(self.monto_total),
            "impuestos": str(self.impuestos),
            "total_factura": str(self.total_factura),
            "metodo_pago": self.metodo_pago,
            "id_divisa": self.id_divisa
        }

# Schema para Factura
>>>>>>> 8e54b907b59f43e6b1d54a92cfc4672d687cb283
class FacturaSchema(SQLAlchemyAutoSchema):
    class Meta:
        model = Factura
        include_relationships = True
        load_instance = True
<<<<<<< HEAD

=======
class Carrito(db.Model):
    __tablename__ = 'carrito'
    id_carrito = db.Column(db.Integer, primary_key=True, autoincrement=True)
    id_usuario = db.Column(db.Integer, db.ForeignKey('usuario.id_usuario', ondelete='CASCADE'))
    fecha_creacion = db.Column(db.Date, nullable=False)

    def to_dict(self):
        return {
            "id_carrito": self.id_carrito,
            "id_usuario": self.id_usuario,
            "fecha_creacion": self.fecha_creacion.isoformat() if self.fecha_creacion else None
        }

# Schema para Carrito
>>>>>>> 8e54b907b59f43e6b1d54a92cfc4672d687cb283
class CarritoSchema(SQLAlchemyAutoSchema):
    class Meta:
        model = Carrito
        include_relationships = True
        load_instance = True

<<<<<<< HEAD
class DivisaSchema(SQLAlchemyAutoSchema):
    class Meta:
        model = Divisa
        include_relationships = True
        load_instance = True

=======

class Resena(db.Model):
    __tablename__ = 'resena'
    id_resena = db.Column(db.Integer, primary_key=True, autoincrement=True)
    id_juego = db.Column(db.Integer, db.ForeignKey('juegos.id_juego', ondelete='CASCADE'))
    id_usuario = db.Column(db.Integer, db.ForeignKey('usuario.id_usuario', ondelete='SET NULL'))
    calificacion = db.Column(db.Integer, nullable=False)
    comentario = db.Column(db.Text)
    fecha_resena = db.Column(db.Date, nullable=False)

    def to_dict(self):
        return {
            "id_resena": self.id_resena,
            "id_juego": self.id_juego,
            "id_usuario": self.id_usuario,
            "calificacion": self.calificacion,
            "comentario": self.comentario,
            "fecha_resena": self.fecha_resena.isoformat() if self.fecha_resena else None
        }

# Schema para Resena
>>>>>>> 8e54b907b59f43e6b1d54a92cfc4672d687cb283
class ResenaSchema(SQLAlchemyAutoSchema):
    class Meta:
        model = Resena
        include_relationships = True
        load_instance = True

<<<<<<< HEAD
class PromocionSchema(SQLAlchemyAutoSchema):
    class Meta:
        model = Promocion
        include_relationships = True
        load_instance = True

=======


class Log(db.Model):
    __tablename__ = 'logs'  # Nombre de la tabla en la base de datos
    id_log = db.Column(db.Integer, primary_key=True, autoincrement=True)  # Clave primaria con auto-incremento
    id_usuario = db.Column(db.Integer, db.ForeignKey('usuario.id_usuario', ondelete='SET NULL'))  # Clave foránea a Usuario
    accion = db.Column(db.String(255), nullable=False)  # Campo obligatorio para la acción
    detalles = db.Column(db.Text)  # Campo opcional para detalles adicionales

    def to_dict(self):
        return {
            "id_log": self.id_log,
            "id_usuario": self.id_usuario,
            "accion": self.accion,
            "fecha_hora": self.fecha_hora.isoformat() if self.fecha_hora else None,
            "detalles": self.detalles
        }

# Esquema para Log
>>>>>>> 8e54b907b59f43e6b1d54a92cfc4672d687cb283
class LogSchema(SQLAlchemyAutoSchema):
    class Meta:
        model = Log
        include_relationships = True
        load_instance = True
<<<<<<< HEAD
=======

    # Campos adicionales o personalizados si fuera necesario
    id_log = fields.Int(dump_only=True)
    id_usuario = fields.Int(required=True)
    accion = fields.Str(required=True)
    detalles = fields.Str()

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
    nombre_rol = db.Column(db.Enum(RolEnum), nullable=False)
    facturas = db.relationship('Factura', backref='usuario', lazy=True)
    carrito = db.relationship('Carrito', uselist=False, backref='usuario')
    reseñas = db.relationship('Resena', backref='usuario', lazy=True)
    logs = db.relationship('Log', backref='usuario', lazy=True)

    def to_dict(self):
        return {
            "id_usuario": self.id_usuario,
            "nombre": self.nombre,
            "apellido": self.apellido,
            "email": self.email,
            "fecha_registro": self.fecha_registro.isoformat() if self.fecha_registro else None,
            "direccion": self.direccion,
            "telefono": self.telefono,
            "nombre_rol": self.nombre_rol.value if self.nombre_rol else None
        }

# Schema para Usuario
class UsuarioSchema(SQLAlchemyAutoSchema):
    class Meta:
        model = Usuario
        include_relationships = True
        load_instance = True

    nombre_rol = fields.String()


class Divisa(db.Model):
    __tablename__ = 'divisas'
    id_divisa = db.Column(db.Integer, primary_key=True, autoincrement=True)
    nombre_divisa = db.Column(db.String(50), nullable=False)
    simbolo = db.Column(db.String(10))
    tipo_cambio = db.Column(db.Numeric(10, 4), nullable=False)

    def to_dict(self):
        return {
            "id_divisa": self.id_divisa,
            "nombre_divisa": self.nombre_divisa,
            "simbolo": self.simbolo,
            "tipo_cambio": str(self.tipo_cambio)
        }

# Schema para Divisa
class DivisaSchema(SQLAlchemyAutoSchema):
    class Meta:
        model = Divisa
        include_relationships = True
        load_instance = True



class Categoria(db.Model):
    __tablename__ = 'categoria'
    id_categoria = db.Column(db.Integer, primary_key=True, autoincrement=True)
    nombre_categoria = db.Column(db.String(50), nullable=False)
    descripcion = db.Column(db.Text)

    def to_dict(self):
        return {
            "id_categoria": self.id_categoria,
            "nombre_categoria": self.nombre_categoria,
            "descripcion": self.descripcion
        }

# Schema para Categoria
class CategoriaSchema(SQLAlchemyAutoSchema):
    class Meta:
        model = Categoria
        include_relationships = True
        load_instance = True

class Juego(db.Model):
    __tablename__ = 'juegos'
    id_juego = db.Column(db.Integer, primary_key=True, autoincrement=True)
    nombre_juego = db.Column(db.String(100), nullable=False)
    descripcion = db.Column(db.Text)
    precio = db.Column(db.Numeric(10, 2), nullable=False)
    stock = db.Column(db.Integer, default=0)
    condicion = db.Column(db.Enum('Nuevo', 'Usado'), nullable=False)
    id_categoria = db.Column(db.Integer, db.ForeignKey('categoria.id_categoria', ondelete='SET NULL'))

    def to_dict(self):
        return {
            "id_juego": self.id_juego,
            "nombre_juego": self.nombre_juego,
            "descripcion": self.descripcion,
            "precio": str(self.precio),
            "stock": self.stock,
            "condicion": self.condicion,
            "id_categoria": self.id_categoria
        }

# Schema para Juego
class JuegoSchema(SQLAlchemyAutoSchema):
    class Meta:
        model = Juego
        include_relationships = True
        load_instance = True

class DetalleFactura(db.Model):
    __tablename__ = 'detalle_factura'
    id_factura = db.Column(db.Integer, db.ForeignKey('factura.id_factura', ondelete='CASCADE'), primary_key=True)
    id_juego = db.Column(db.Integer, db.ForeignKey('juegos.id_juego', ondelete='CASCADE'), primary_key=True)
    cantidad = db.Column(db.Integer, nullable=False)
    precio_unitario = db.Column(db.Numeric(10, 2), nullable=False)

    def to_dict(self):
        return {
            "id_factura": self.id_factura,
            "id_juego": self.id_juego,
            "cantidad": self.cantidad,
            "precio_unitario": str(self.precio_unitario)
        }

# Schema para DetalleFactura
class DetalleFacturaSchema(SQLAlchemyAutoSchema):
    class Meta:
        model = DetalleFactura
        include_relationships = True
        load_instance = True

class Promocion(db.Model):
    __tablename__ = 'promocion'
    id_promocion = db.Column(db.Integer, primary_key=True, autoincrement=True)
    nombre_promocion = db.Column(db.String(100), nullable=False)
    tipo_descuento = db.Column(db.Enum('Porcentaje', 'Fijo'), nullable=False)
    valor_descuento = db.Column(db.Numeric(5, 2), nullable=False)
    fecha_inicio = db.Column(db.Date, nullable=False)
    fecha_fin = db.Column(db.Date, nullable=False)

    def to_dict(self):
        return {
            "id_promocion": self.id_promocion,
            "nombre_promocion": self.nombre_promocion,
            "tipo_descuento": self.tipo_descuento,
            "valor_descuento": str(self.valor_descuento),
            "fecha_inicio": self.fecha_inicio.isoformat() if self.fecha_inicio else None,
            "fecha_fin": self.fecha_fin.isoformat() if self.fecha_fin else None
        }

# Schema para Promocion
class PromocionSchema(SQLAlchemyAutoSchema):
    class Meta:
        model = Promocion
        include_relationships = True
        load_instance = True
>>>>>>> 8e54b907b59f43e6b1d54a92cfc4672d687cb283
