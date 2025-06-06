from datetime import datetime, date
from flask_sqlalchemy import SQLAlchemy
from marshmallow_sqlalchemy import SQLAlchemyAutoSchema
from decimal import Decimal
from marshmallow import fields
from werkzeug.security import generate_password_hash, check_password_hash
import enum

db = SQLAlchemy()

# Enumeraciones
class RolUsuario(enum.Enum):
    ADMIN = "ADMIN"
    USUARIO = "USUARIO"
    VENDEDOR = "VENDEDOR"



# Tabla intermedia personalizada para Detalle de Carrito
class DetalleCarrito(db.Model):
    __tablename__ = 'detalle_carrito'

    carrito_id = db.Column(db.Integer, db.ForeignKey('carrito.id'), primary_key=True)
    juego_id = db.Column(db.Integer, db.ForeignKey('juego.id'), primary_key=True)
    cantidad = db.Column(db.Integer, nullable=False, default=1)
    precio_con_descuento = db.Column(db.Numeric, nullable=False)  # Este es el nuevo campo para el precio con descuento

    juego = db.relationship('Juego', backref='detalles_carrito')
    carrito = db.relationship('Carrito', backref='detalles')

juegos_promociones = db.Table(
    'juegos_promociones',
    db.Column('juego_id', db.Integer, db.ForeignKey('juego.id'), primary_key=True),
    db.Column('promocion_id', db.Integer, db.ForeignKey('promocion.id'), primary_key=True)
)

# Modelos
class Usuario(db.Model):
    __tablename__ = 'usuario'
    
    id = db.Column(db.Integer, primary_key=True)
    nombre = db.Column(db.String(50), nullable=False)
    apellido = db.Column(db.String(50), nullable=False)  
    email = db.Column(db.String(100), unique=True, nullable=False)
    contrasena_hash = db.Column(db.String(255), nullable=False)
    rol = db.Column(db.Enum(RolUsuario), default=RolUsuario.USUARIO, nullable=False)
    fecha_registro = db.Column(db.Date, default=datetime.utcnow, nullable=False)  
    direccion = db.Column(db.String(150), nullable=True)  
    telefono = db.Column(db.String(20), nullable=True)
    reset_token = db.Column(db.String(100), nullable=True)

    facturas = db.relationship('Factura', back_populates='usuario', cascade='all, delete-orphan')
    carrito = db.relationship('Carrito', back_populates='usuario', uselist=False, cascade='all, delete-orphan')
    resenas = db.relationship('Resena', back_populates='usuario', cascade='all, delete-orphan', lazy='dynamic')
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
    __tablename__ = 'juego'

    id = db.Column(db.Integer, primary_key=True)
    titulo = db.Column(db.String(100), nullable=False)
    descripcion = db.Column(db.String(500), nullable=True)
    precio = db.Column(db.Float, nullable=False)
    stock = db.Column(db.Integer, default=0, nullable=False)
    condicion = db.Column(db.String(50), nullable=False)
    categoria_id = db.Column(db.Integer, db.ForeignKey('categoria.id'), nullable=False)
    imagen_url = db.Column(db.String(500), nullable=True)

    usuario_id = db.Column(db.Integer, db.ForeignKey('usuario.id'), nullable=False)
    usuario = db.relationship('Usuario', backref='juegos')  # Relación inversa

    categoria = db.relationship('Categoria', back_populates='juegos')
    resenas = db.relationship('Resena', back_populates='juego', cascade='all, delete-orphan', lazy='dynamic')
    promociones = db.relationship('Promocion', secondary='juegos_promociones', back_populates='juegos')

    def calcular_precio_con_descuento(self):
        hoy = date.today()
        precio_final = float(self.precio)

        # Descuentos globales activos
        promociones_globales = Promocion.query.filter(
            Promocion.es_global.is_(True),
            Promocion.fecha_inicio <= hoy,
            Promocion.fecha_fin >= hoy
        ).all()

        for promocion in promociones_globales:
            if promocion.tipo_descuento == 'Porcentaje':
                precio_final -= (precio_final * float(promocion.valor_descuento) / 100)
            elif promocion.tipo_descuento == 'Monto_Fijo':
                precio_final -= float(promocion.valor_descuento)

        # Descuentos específicos del juego
        for promocion in self.promociones:
            if promocion.fecha_inicio <= hoy <= promocion.fecha_fin:
                if promocion.tipo_descuento == 'Porcentaje':
                    precio_final -= (precio_final * float(promocion.valor_descuento) / 100)
                elif promocion.tipo_descuento == 'Monto_Fijo':
                    precio_final -= float(promocion.valor_descuento)

        return max(precio_final, 0)

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
    detalles = db.relationship('DetalleFactura', back_populates='factura')  # CORRECCIÓN
    usuario_id = db.Column(db.Integer, db.ForeignKey('usuario.id'), nullable=False)  
    usuario = db.relationship('Usuario', back_populates='facturas')  
    divisa = db.relationship('Divisa', back_populates='facturas')
    
    def calcular_total(self):
        # Sumamos los subtotales de cada detalle de factura.
        self.monto_subtotal = sum([detalle.subtotal for detalle in self.detalles])
        
        # Calculamos los impuestos (puedes ajustar el porcentaje si es diferente).
        self.impuestos = self.monto_subtotal * 0.5  # 19% de impuestos (ajustar si es necesario).
        
        # Calculamos el total sumando los impuestos al subtotal.
        self.total = round(self.monto_subtotal + self.impuestos, 2)
        return self.total

# Tabla intermedia personalizada para Detalle de Factura
class DetalleFactura(db.Model):
    __tablename__ = 'detalle_factura'
    factura_id = db.Column(db.Integer, db.ForeignKey('factura.id'), primary_key=True)
    juego_id = db.Column(db.Integer, db.ForeignKey('juego.id'), primary_key=True)
    cantidad = db.Column(db.Integer, nullable=False, default=1)

    juego = db.relationship('Juego', backref='detalles_factura')
    factura = db.relationship('Factura', back_populates='detalles')


class Carrito(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    usuario_id = db.Column(db.Integer, db.ForeignKey('usuario.id'), nullable=False)
    usuario = db.relationship('Usuario', back_populates='carrito')
    total = db.Column(db.Float, nullable=False, default=0.0)

    def calcular_total(self):
        # Usamos el método calcular_precio_con_descuento de Juego para obtener el precio con descuento.
        self.total = sum(detalle.juego.calcular_precio_con_descuento() * detalle.cantidad for detalle in self.detalles)
        return round(self.total, 2)  # Redondear el total para mayor precisión.


class Divisa(db.Model):
    __tablename__ = 'divisas'

    id = db.Column(db.Integer, primary_key=True)  
    nombre = db.Column(db.String(50), nullable=False)  
    simbolo = db.Column(db.String(10), nullable=False)  
    tipo_cambio = db.Column(db.Float(10, 4), nullable=False)  

    facturas = db.relationship('Factura', back_populates='divisa', cascade='all, delete-orphan')

class Resena(db.Model):
    __tablename__ = 'resena'
    
    id = db.Column(db.Integer, primary_key=True)
    juego_id = db.Column(db.Integer, db.ForeignKey('juego.id', ondelete='CASCADE'), nullable=False)
    usuario_id = db.Column(db.Integer, db.ForeignKey('usuario.id', ondelete='CASCADE'), nullable=False)
    puntuacion = db.Column(db.Integer, nullable=False)
    comentario = db.Column(db.Text, nullable=False)
    fecha = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)
    editada = db.Column(db.Boolean, default=False, nullable=False)  # Cambiado a nullable=False
    fecha_edicion = db.Column(db.DateTime, nullable=True)
    
    # Relaciones
    juego = db.relationship('Juego', back_populates='resenas')
    usuario = db.relationship('Usuario', back_populates='resenas')
    
    __table_args__ = (
        db.CheckConstraint('puntuacion >= 1 AND puntuacion <= 5', name='check_puntuacion_rango'),
    )
    
    def __init__(self, comentario, puntuacion, usuario_id, juego_id, **kwargs):
        """
        Constructor mejorado para manejar todos los campos posibles
        """
        self.comentario = comentario
        self.puntuacion = puntuacion
        self.usuario_id = usuario_id
        self.juego_id = juego_id
        self.editada = kwargs.get('editada', False)  # Valor por defecto False
        self.fecha_edicion = kwargs.get('fecha_edicion')  # None por defecto

    def actualizar(self, comentario=None, puntuacion=None):
        """
        Método para actualizar la reseña
        """
        if comentario:
            self.comentario = comentario
        if puntuacion:
            self.puntuacion = puntuacion
        self.editada = True
        self.fecha_edicion = datetime.utcnow()

class Promocion(db.Model):
    __tablename__ = 'promocion'
    
    id = db.Column(db.Integer, primary_key=True)
    nombre = db.Column(db.String(100), nullable=False)
    tipo_descuento = db.Column(db.Enum('Porcentaje', 'Monto_Fijo', name='tipo_descuento_enum'), nullable=False)
    valor_descuento = db.Column(db.Float(5, 2), nullable=False)
    fecha_inicio = db.Column(db.Date, nullable=False)
    fecha_fin = db.Column(db.Date, nullable=False)
    es_global = db.Column(db.Boolean, default=False)

    # Se eliminó lazy='joined' para evitar errores de JOIN innecesarios
    juegos = db.relationship('Juego', secondary='juegos_promociones', back_populates='promociones')
    
    def esta_activa(self):
        hoy = date.today()
        return self.fecha_inicio <= hoy <= self.fecha_fin

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
        return value.value if value else None

class UsuarioSchema(SQLAlchemyAutoSchema):
    rol = EnumADiccionario(attribute="rol")
    class Meta:
        model = Usuario
        include_relationships = True
        load_instance = True
        exclude = ("contrasena_hash",)

class CategoriaSchema(SQLAlchemyAutoSchema):
    class Meta:
        model = Categoria
        include_relationships = True
        load_instance = True

class PromocionSchema(SQLAlchemyAutoSchema):
    juegos = fields.Nested('JuegoSchema', many=True, exclude=('promociones', 'resenas', 'categoria'))

    class Meta:
        model = Promocion
        include_relationships = True
        load_instance = True
        exclude = ('juegos.promociones',)

    valor_descuento = fields.Method("serialize_valor_descuento")

    def serialize_valor_descuento(self, obj):
        # Convierte cualquier tipo Decimal a float
        if isinstance(obj.valor_descuento, Decimal):
            return float(obj.valor_descuento)
        return obj.valor_descuento

class JuegoSchema(SQLAlchemyAutoSchema):
    categoria = fields.Nested('CategoriaSchema', exclude=('juegos',))
    promociones = fields.Nested(PromocionSchema, many=True, exclude=('juegos',))
    
    class Meta:
        model = Juego
        include_relationships = True
        load_instance = True
        exclude = ('promociones.juegos',)  # Evita referencia circular
        def get_precio_con_descuento(self, obj):
            return obj.calcular_precio_con_descuento()

class DetalleFacturaSchema(SQLAlchemyAutoSchema):
    class Meta:
        model = DetalleFactura
        include_relationships = True
        load_instance = True
        include_fk = True

    juego = fields.Nested('JuegoSchema')  # Esto hace que venga la info del juego dentro del detalle
    def get_precio_con_descuento(self, obj):
        return obj.juego.calcular_precio_con_descuento()

class FacturaSchema(SQLAlchemyAutoSchema):
    class Meta:
        model = Factura
        include_relationships = True
        load_instance = True
        include_fk = True  # Esto también puedes dejarlo si quieres ver los IDs de relaciones

    juego = fields.Nested('JuegoSchema')  # Esto hace que venga la info del juego dentro del detalle



class DetalleCarritoSchema(SQLAlchemyAutoSchema):
    class Meta:
        model = DetalleCarrito
        include_relationships = True
        load_instance = True
        include_fk = True

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
    
    # Conversión explícita para Decimal/Float
    tipo_cambio = fields.Method("serialize_tipo_cambio")
    
    def serialize_tipo_cambio(self, obj):
        # Convierte Decimal o Float a número serializable
        if isinstance(obj.tipo_cambio, Decimal):
            return float(obj.tipo_cambio)
        return obj.tipo_cambio  # Ya es float

class ResenaSchema(SQLAlchemyAutoSchema):
    class Meta:
        model = Resena
        include_relationships = True
        load_instance = True
    
    usuario = fields.Nested('UsuarioSchema', only=('id', 'nombre', 'email'))
    juego = fields.Nested('JuegoSchema', only=('id', 'titulo'))
    
    # Formateo de fechas
    fecha = fields.Method("format_fecha")
    fecha_edicion = fields.Method("format_fecha_edicion")
    
    def format_fecha(self, obj):
        return obj.fecha.strftime('%Y-%m-%d %H:%M') if obj.fecha else None
    
    def format_fecha_edicion(self, obj):
        return obj.fecha_edicion.strftime('%Y-%m-%d %H:%M') if obj.fecha_edicion else None

class LogSchema(SQLAlchemyAutoSchema):
    class Meta:
        model = Log
        include_relationships = True
        load_instance = True
