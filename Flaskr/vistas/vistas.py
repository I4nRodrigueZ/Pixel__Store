from flask import request
from flask_restful import Resource
from ..modelos import db, Usuario, Juego, Factura, Carrito, Notificacion, HistorialPrecio
from ..schemas import UsuarioSchema, JuegoSchema, FacturaSchema, CarritoSchema, NotificacionSchema, HistorialPrecioSchema

usuario_schema = UsuarioSchema()
usuarios_schema = UsuarioSchema(many=True)
juego_schema = JuegoSchema()
juegos_schema = JuegoSchema(many=True)
factura_schema = FacturaSchema()
facturas_schema = FacturaSchema(many=True)
carrito_schema = CarritoSchema()
carritos_schema = CarritoSchema(many=True)
notificacion_schema = NotificacionSchema()
notificaciones_schema = NotificacionSchema(many=True)
historial_schema = HistorialPrecioSchema()
historiales_schema = HistorialPrecioSchema(many=True)

# Vista para manejar todos los usuarios
class VistaUsuarios(Resource):
    def get(self):
        return usuarios_schema.dump(Usuario.query.all())

    def post(self):
        nuevo_usuario = Usuario(
            nombre=request.json['nombre'],
            apellido=request.json['apellido'],
            email=request.json['email'],
            contraseña=request.json['contraseña'],
            fecha_registro=request.json['fecha_registro'],
            direccion=request.json.get('direccion'),
            telefono=request.json.get('telefono'),
            nombre_rol=request.json['nombre_rol']
        )
        db.session.add(nuevo_usuario)
        db.session.commit()
        return usuario_schema.dump(nuevo_usuario), 201

class VistaUsuario(Resource):
    def get(self, id_usuario):
        usuario = Usuario.query.get_or_404(id_usuario)
        return usuario_schema.dump(usuario)

    def put(self, id_usuario):
        usuario = Usuario.query.get_or_404(id_usuario)
        usuario.nombre = request.json.get('nombre', usuario.nombre)
        usuario.apellido = request.json.get('apellido', usuario.apellido)
        usuario.email = request.json.get('email', usuario.email)
        usuario.contraseña = request.json.get('contraseña', usuario.contraseña)
        usuario.direccion = request.json.get('direccion', usuario.direccion)
        usuario.telefono = request.json.get('telefono', usuario.telefono)
        usuario.nombre_rol = request.json.get('nombre_rol', usuario.nombre_rol)
        db.session.commit()
        return usuario_schema.dump(usuario)

    def delete(self, id_usuario):
        usuario = Usuario.query.get_or_404(id_usuario)
        db.session.delete(usuario)
        db.session.commit()
        return '', 204

# Vista para manejar todos los juegos
class VistaJuegos(Resource):
    def get(self):
        return juegos_schema.dump(Juego.query.all())

    def post(self):
        nuevo_juego = Juego(
            nombre_juego=request.json['nombre_juego'],
            descripcion=request.json.get('descripcion'),
            precio=request.json['precio'],
            stock=request.json.get('stock', 0),
            condicion=request.json['condicion'],
            id_categoria=request.json['id_categoria']
        )
        db.session.add(nuevo_juego)
        db.session.commit()
        return juego_schema.dump(nuevo_juego), 201

class VistaJuego(Resource):
    def get(self, id_juego):
        juego = Juego.query.get_or_404(id_juego)
        return juego_schema.dump(juego)

    def put(self, id_juego):
        juego = Juego.query.get_or_404(id_juego)
        juego.nombre_juego = request.json.get('nombre_juego', juego.nombre_juego)
        juego.descripcion = request.json.get('descripcion', juego.descripcion)
        juego.precio = request.json.get('precio', juego.precio)
        juego.stock = request.json.get('stock', juego.stock)
        juego.condicion = request.json.get('condicion', juego.condicion)
        juego.id_categoria = request.json.get('id_categoria', juego.id_categoria)
        db.session.commit()
        return juego_schema.dump(juego)

    def delete(self, id_juego):
        juego = Juego.query.get_or_404(id_juego)
        db.session.delete(juego)
        db.session.commit()
        return '', 204

# Vista para manejar todas las facturas
class VistaFacturas(Resource):
    def get(self):
        return facturas_schema.dump(Factura.query.all())

    def post(self):
        nueva_factura = Factura(
            id_usuario=request.json['id_usuario'],
            fecha_factura=request.json['fecha_factura'],
            monto_total=request.json['monto_total'],
            impuestos=request.json.get('impuestos', 0),
            total_factura=request.json['total_factura'],
            metodo_pago=request.json['metodo_pago'],
            id_divisa=request.json['id_divisa']
        )
        db.session.add(nueva_factura)
        db.session.commit()
        return factura_schema.dump(nueva_factura), 201

class VistaFactura(Resource):
    def get(self, id_factura):
        factura = Factura.query.get_or_404(id_factura)
        return factura_schema.dump(factura)

# Vista para manejar los carritos
class VistaCarritos(Resource):
    def get(self):
        return carritos_schema.dump(Carrito.query.all())

    def post(self):
        nuevo_carrito = Carrito(
            id_usuario=request.json['id_usuario'],
            fecha_creacion=request.json['fecha_creacion']
        )
        db.session.add(nuevo_carrito)
        db.session.commit()
        return carrito_schema.dump(nuevo_carrito), 201

class VistaCarrito(Resource):
    def get(self, id_carrito):
        carrito = Carrito.query.get_or_404(id_carrito)
        return carrito_schema.dump(carrito)

    def delete(self, id_carrito):
        carrito = Carrito.query.get_or_404(id_carrito)
        db.session.delete(carrito)
        db.session.commit()
        return '', 204

# Vista para manejar las notificaciones
class VistaNotificaciones(Resource):
    def get(self):
        return notificaciones_schema.dump(Notificacion.query.all())

    def post(self):
        nueva_notificacion = Notificacion(
            id_usuario=request.json['id_usuario'],
            mensaje=request.json['mensaje'],
            fecha_envio=request.json['fecha_envio']
        )
        db.session.add(nueva_notificacion)
        db.session.commit()
        return notificacion_schema.dump(nueva_notificacion), 201

# Vista para manejar el historial de precios
class VistaHistorialPrecios(Resource):
    def get(self):
        return historiales_schema.dump(HistorialPrecio.query.all())

    def post(self):
        nuevo_historial = HistorialPrecio(
            id_juego=request.json['id_juego'],
            precio=request.json['precio'],
            fecha_cambio=request.json['fecha_cambio']
        )
        db.session.add(nuevo_historial)
        db.session.commit()
        return historial_schema.dump(nuevo_historial), 201
