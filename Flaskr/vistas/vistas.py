from datetime import datetime
from flask import request
from flask_restful import Resource
from sqlalchemy.exc import IntegrityError
from flask_jwt_extended import (
    jwt_required, create_access_token, get_jwt_identity
)
from ..Modelos import db,RolUsuario, Usuario, Juego, Factura, Carrito, Categoria, Divisa, Resena, Promocion, Log, UsuarioSchema, JuegoSchema, CategoriaSchema, FacturaSchema, CarritoSchema, DivisaSchema , ResenaSchema, PromocionSchema, LogSchema

usuario_schema = UsuarioSchema()
usuarios_schema = UsuarioSchema(many=True)
juego_schema = JuegoSchema()
juegos_schema = JuegoSchema(many=True)
categoria_schema = CategoriaSchema()
categorias_schema = CategoriaSchema(many=True)
factura_schema = FacturaSchema()
facturas_schema = FacturaSchema(many=True)
carrito_schema = CarritoSchema()
carritos_schema = CarritoSchema(many=True)
divisa_schema = DivisaSchema()
divisas_schema = DivisaSchema(many=True)
resena_schema = ResenaSchema()
resenas_schema = ResenaSchema(many=True)
promocion_schema = PromocionSchema()
promociones_schema = PromocionSchema(many=True)
log_schema = LogSchema()
logs_schema = LogSchema(many=True)


class VistaSignIn(Resource):
    def post(self):
        # Obtener los datos enviados en el cuerpo de la solicitud
        nombre_usuario = request.json.get("nombre")
        apellido_usuario = request.json.get("apellido")  # Nuevo campo
        email_usuario = request.json.get("email")
        contrasena_usuario = request.json.get("contrasena")
        rol_usuario = request.json.get("rol", "usuario")  # Rol predeterminado: usuario
        telefono_usuario = request.json.get("telefono")  # Nuevo campo
        direccion_usuario = request.json.get("direccion")  # Nuevo campo

        # Validar que el rol sea válido
        if rol_usuario not in [RolUsuario.USUARIO.value, RolUsuario.VENDEDOR.value]:
            return {"mensaje": "Rol no válido. Solo se permiten 'usuario' o 'vendedor'."}, 400

        # Verificar si el nombre de usuario o el correo ya existen
        if Usuario.query.filter_by(nombre=nombre_usuario).first():
            return {"mensaje": "El nombre de usuario ya está registrado"}, 409

        if Usuario.query.filter_by(email=email_usuario).first():
            return {"mensaje": "El correo electrónico ya está registrado"}, 409

        # Crear el nuevo usuario con los nuevos campos
        nuevo_usuario = Usuario(
            nombre=nombre_usuario,
            apellido=apellido_usuario,  # Asignar apellido
            email=email_usuario,
            rol=RolUsuario(rol_usuario),  # Convertir el rol en el enum correspondiente
            telefono=telefono_usuario,  # Asignar teléfono
            direccion=direccion_usuario  # Asignar dirección
        )
        nuevo_usuario.contrasena = contrasena_usuario

        # Agregar el nuevo usuario a la base de datos
        db.session.add(nuevo_usuario)
        try:
            db.session.commit()
        except IntegrityError:
            db.session.rollback()
            return {"mensaje": "Error al crear el usuario. Intenta nuevamente."}, 500

        # Retornar una respuesta exitosa
        return {"mensaje": "Usuario creado exitosamente"}, 201


class VistalogIn(Resource):
    def post(self):
        # Obtener credenciales del usuario
        nombre = request.json.get("nombre")
        contrasena = request.json.get("contrasena")

        # Buscar el usuario por nombre
        usuario = Usuario.query.filter_by(nombre=nombre).first()

        # Verificar credenciales
        if usuario and usuario.verificar_contrasena(contrasena):
            # Generar token de acceso asegurándonos de que el identity sea una cadena
            token_de_acceso = create_access_token(identity=str(usuario.id))
            return {
                "mensaje": "Inicio de sesión exitoso",
                "token": token_de_acceso
            }, 200

        return {"mensaje": "Usuario o contrasena incorrectos"}, 401

class VistaProtegida(Resource):
    @jwt_required()
    def get(self):
        usuario_actual = get_jwt_identity()
        return {"mensaje": f"Bienvenido {usuario_actual}"}, 200

class VistaUsuarios(Resource):
    @jwt_required()
    def get(self):
        return usuarios_schema.dump(Usuario.query.all()), 200

    @jwt_required()
    def post(self):
        try:
            nuevo_usuario = Usuario(
                nombre=request.json['nombre'],
                apellido=request.json['apellido'],  # Campo adicional
                email=request.json['email'],
                contrasena=request.json['contrasena'],
                fecha_registro=request.json['fecha_registro'],
                rol=RolUsuario(request.json['nombre_rol']),  # Convertir rol a Enum
                telefono=request.json['telefono'],  # Campo adicional
                direccion=request.json['direccion']  # Campo adicional
            )
            db.session.add(nuevo_usuario)
            db.session.commit()
            return usuario_schema.dump(nuevo_usuario), 201
        except ValueError:
            return {"mensaje": "Rol inválido. Use 'usuario' o 'vendedor'."}, 400
        except IntegrityError:
            db.session.rollback()
            return {"mensaje": "Error al crear el usuario. Verifique los datos ingresados."}, 409


class VistaUsuario(Resource):
    @jwt_required()
    def get(self, id_usuario):
        # Recuperar un usuario por su id
        usuario = Usuario.query.get_or_404(id_usuario)
        return usuario_schema.dump(usuario), 200

    @jwt_required()
    def put(self, id_usuario):
        # Recuperar el usuario a editar
        usuario = Usuario.query.get_or_404(id_usuario)
        
        # Actualizar los campos del usuario, con valores proporcionados o los actuales
        usuario.nombre = request.json.get('nombre', usuario.nombre)
        usuario.apellido = request.json.get('apellido', usuario.apellido)  # Nuevo campo
        usuario.email = request.json.get('email', usuario.email)
        
        # Aquí debes cambiar 'nombre_rol' por 'rol'
        usuario.rol = request.json.get('rol', usuario.rol)
        
        usuario.telefono = request.json.get('telefono', usuario.telefono)  # Nuevo campo
        usuario.direccion = request.json.get('direccion', usuario.direccion)  # Nuevo campo
        
        # Solo actualizar la contraseña si se proporciona
        if 'contrasena' in request.json and request.json['contrasena']:
            usuario.contrasena = request.json['contrasena']
        
        # Realizar la actualización en la base de datos
        db.session.commit()
        
        # Retornar el usuario actualizado
        return usuario_schema.dump(usuario), 200

    @jwt_required()
    def delete(self, id_usuario):
        # Eliminar un usuario por su id
        usuario = Usuario.query.get_or_404(id_usuario)
        db.session.delete(usuario)
        db.session.commit()
        return '', 204



class VistaJuegos(Resource):
    @jwt_required()
    def get(self):
        return juegos_schema.dump(Juego.query.all()), 200

    @jwt_required()
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
    @jwt_required()
    def get(self, id_juego):
        juego = Juego.query.get_or_404(id_juego)
        return juego_schema.dump(juego), 200

    @jwt_required()
    def put(self, id_juego):
        juego = Juego.query.get_or_404(id_juego)
        juego.nombre_juego = request.json.get('nombre_juego', juego.nombre_juego)
        juego.descripcion = request.json.get('descripcion', juego.descripcion)
        juego.precio = request.json.get('precio', juego.precio)
        juego.stock = request.json.get('stock', juego.stock)
        juego.condicion = request.json.get('condicion', juego.condicion)
        juego.id_categoria = request.json.get('id_categoria', juego.id_categoria)
        db.session.commit()
        return juego_schema.dump(juego), 200

    @jwt_required()
    def delete(self, id_juego):
        juego = Juego.query.get_or_404(id_juego)
        db.session.delete(juego)
        db.session.commit()
        return '', 204


class VistaCategoria(Resource):
    def get(self, id_categoria):
        """Obtener una categoría específica por su ID."""
        categoria = Categoria.query.get(id_categoria)
        if not categoria:
            return {"mensaje": "Categoría no encontrada"}, 404
        return categoria_schema.dump(categoria), 200

    def put(self, id_categoria):
        """Actualizar una categoría específica."""
        categoria = Categoria.query.get(id_categoria)
        if not categoria:
            return {"mensaje": "Categoría no encontrada"}, 404

        nombre = request.json.get("nombre")
        if not nombre:
            return {"mensaje": "El nombre de la categoría es obligatorio"}, 400

        # Verificar si el nuevo nombre ya existe
        if Categoria.query.filter(Categoria.nombre == nombre, Categoria.id != id_categoria).first():
            return {"mensaje": "Ya existe una categoría con ese nombre"}, 409

        categoria.nombre = nombre
        db.session.commit()
        return categoria_schema.dump(categoria), 200

    def delete(self, id_categoria):
        """Eliminar una categoría por su ID."""
        categoria = Categoria.query.get(id_categoria)
        if not categoria:
            return {"mensaje": "Categoría no encontrada"}, 404

        db.session.delete(categoria)
        db.session.commit()
        return {"mensaje": "Categoría eliminada exitosamente"}, 200


class VistaCategorias(Resource):
    def get(self):
        """Obtener todas las categorías."""
        categorias = Categoria.query.all()
        return categorias_schema.dump(categorias), 200

    def post(self):
        """Crear una nueva categoría."""
        nombre = request.json.get("nombre")
        if not nombre:
            return {"mensaje": "El nombre de la categoría es obligatorio"}, 400

        # Verificar si ya existe una categoría con ese nombre
        if Categoria.query.filter_by(nombre=nombre).first():
            return {"mensaje": "Ya existe una categoría con ese nombre"}, 409

        nueva_categoria = Categoria(nombre=nombre)
        db.session.add(nueva_categoria)
        db.session.commit()
        return categoria_schema.dump(nueva_categoria), 201

class VistaFacturas(Resource):
    @jwt_required()
    def get(self):
        # Obtener todas las facturas y devolverlas usando el schema
        return facturas_schema.dump(Factura.query.all()), 200

    @jwt_required()
    def post(self):
        # Crear una nueva factura con los datos enviados en la solicitud
        nueva_factura = Factura(
            usuario_id=request.json['usuario_id'],  # Asegurarse de que el campo coincida con el modelo
            fecha=request.json['fecha'],  # Fecha de la factura
            total=request.json['total'],  # Monto total de la factura
            impuestos=request.json.get('impuestos', 0),  # Impuestos (opcional, si no se proporciona será 0)
            total_factura=request.json['total_factura'],  # Total final de la factura
            metodo_pago=request.json['metodo_pago'],  # Método de pago
            id_divisa=request.json['id_divisa'],  # ID de la divisa
            juegos=request.json.get('juegos', []),  # Juegos asociados a la factura (opcional)
        )
        
        # Agregar la nueva factura a la base de datos
        db.session.add(nueva_factura)
        try:
            db.session.commit()
            return factura_schema.dump(nueva_factura), 201
        except IntegrityError:
            db.session.rollback()
            return {"mensaje": "Error al crear la factura"}, 409
    
class VistaFactura(Resource):
    @jwt_required()
    def get(self, id_factura):
        """Obtener una factura específica por su ID."""
        factura = Factura.query.get(id_factura)
        if not factura:
            return {"mensaje": "Factura no encontrada"}, 404
        return factura_schema.dump(factura), 200

    @jwt_required()
    def put(self, id_factura):
        """Actualizar una factura específica."""
        factura = Factura.query.get(id_factura)
        if not factura:
            return {"mensaje": "Factura no encontrada"}, 404

        # Actualizar los campos de la factura con los datos proporcionados (incluyendo los nuevos)
        factura.fecha = request.json.get('fecha', factura.fecha)
        factura.total = request.json.get('total', factura.total)
        factura.impuestos = request.json.get('impuestos', factura.impuestos)
        factura.total_factura = request.json.get('total_factura', factura.total_factura)
        factura.metodo_pago = request.json.get('metodo_pago', factura.metodo_pago)
        factura.id_divisa = request.json.get('id_divisa', factura.id_divisa)
        factura.usuario_id = request.json.get('usuario_id', factura.usuario_id)  # Actualizando el ID del usuario

        # Actualizar los juegos asociados (si se envían)
        if 'juegos' in request.json:
            factura.juegos = request.json['juegos']  # Actualiza la relación con los juegos

        db.session.commit()
        return factura_schema.dump(factura), 200

    @jwt_required()
    def delete(self, id_factura):
        """Eliminar una factura por su ID."""
        factura = Factura.query.get(id_factura)
        if not factura:
            return {"mensaje": "Factura no encontrada"}, 404

        db.session.delete(factura)
        db.session.commit()
        return {"mensaje": "Factura eliminada exitosamente"}, 200


class VistaCarritos(Resource):
    @jwt_required()
    def get(self):
        return carritos_schema.dump(Carrito.query.all()), 200

    @jwt_required()
    def post(self):
        nuevo_carrito = Carrito(
            id_usuario=request.json['id_usuario'],
            fecha_creacion=request.json['fecha_creacion']
        )
        db.session.add(nuevo_carrito)
        db.session.commit()
        return carrito_schema.dump(nuevo_carrito), 201


class VistaCarrito(Resource):
    @jwt_required()
    def get(self, id_carrito):
        carrito = Carrito.query.get_or_404(id_carrito)
        return carrito_schema.dump(carrito), 200

    @jwt_required()
    def delete(self, id_carrito):
        carrito = Carrito.query.get_or_404(id_carrito)
        db.session.delete(carrito)
        db.session.commit()
        return '', 204

class VistaDivisas(Resource):
    @jwt_required()
    def get(self):
        # Obtener todas las divisas y devolverlas usando el schema
        return divisas_schema.dump(Divisa.query.all()), 200

    @jwt_required()
    def post(self):
        # Crear una nueva divisa con los datos enviados en la solicitud
        nueva_divisa = Divisa(
            nombre=request.json['nombre'],  # Nombre de la divisa
            simbolo=request.json['simbolo'],  # Símbolo de la divisa
            tasa_cambio=request.json['tasa_cambio']  # Tasa de cambio
        )
        
        # Agregar la nueva divisa a la base de datos
        db.session.add(nueva_divisa)
        try:
            db.session.commit()
            return divisa_schema.dump(nueva_divisa), 201
        except IntegrityError:
            db.session.rollback()
            return {"mensaje": "Error al crear la divisa"}, 409
        
class VistaDivisa(Resource):
    @jwt_required()
    def get(self, id_divisa):
        """Obtener una divisa específica por su ID."""
        divisa = Divisa.query.get(id_divisa)
        if not divisa:
            return {"mensaje": "Divisa no encontrada"}, 404
        return divisa_schema.dump(divisa), 200

    @jwt_required()
    def put(self, id_divisa):
        """Actualizar una divisa específica."""
        divisa = Divisa.query.get(id_divisa)
        if not divisa:
            return {"mensaje": "Divisa no encontrada"}, 404

        # Actualizar los campos de la divisa con los datos proporcionados
        divisa.nombre = request.json.get('nombre', divisa.nombre)
        divisa.simbolo = request.json.get('simbolo', divisa.simbolo)
        divisa.tasa_cambio = request.json.get('tasa_cambio', divisa.tasa_cambio)

        db.session.commit()
        return divisa_schema.dump(divisa), 200

    @jwt_required()
    def delete(self, id_divisa):
        """Eliminar una divisa por su ID."""
        divisa = Divisa.query.get(id_divisa)
        if not divisa:
            return {"mensaje": "Divisa no encontrada"}, 404

        db.session.delete(divisa)
        db.session.commit()
        return {"mensaje": "Divisa eliminada exitosamente"}, 200

class VistaResenas(Resource):
    @jwt_required()
    def get(self):
        # Obtener todas las reseñas y devolverlas usando el schema
        return resenas_schema.dump(Resena.query.all()), 200

    @jwt_required()
    def post(self):
        # Crear una nueva reseña con los datos enviados en la solicitud
        nueva_resena = Resena(
            comentario=request.json['comentario'],  # Comentario de la reseña
            puntuacion=request.json['puntuacion'],  # Puntuación de la reseña
            usuario_id=request.json['usuario_id'],  # ID del usuario que hizo la reseña
            juego_id=request.json['juego_id']  # ID del juego que fue reseñado
        )
        
        # Agregar la nueva reseña a la base de datos
        db.session.add(nueva_resena)
        try:
            db.session.commit()
            return resena_schema.dump(nueva_resena), 201
        except IntegrityError:
            db.session.rollback()
            return {"mensaje": "Error al crear la reseña"}, 409

class VistaResena(Resource):
    @jwt_required()
    def get(self, id_resena):
        """Obtener una reseña específica por su ID."""
        resena = Resena.query.get(id_resena)
        if not resena:
            return {"mensaje": "Resena no encontrada"}, 404
        return resena_schema.dump(resena), 200

    @jwt_required()
    def put(self, id_resena):
        """Actualizar una reseña específica."""
        resena = Resena.query.get(id_resena)
        if not resena:
            return {"mensaje": "Resena no encontrada"}, 404

        # Actualizar los campos de la reseña con los datos proporcionados
        resena.comentario = request.json.get('comentario', resena.comentario)
        resena.puntuacion = request.json.get('puntuacion', resena.puntuacion)
        resena.usuario_id = request.json.get('usuario_id', resena.usuario_id)
        resena.juego_id = request.json.get('juego_id', resena.juego_id)

        db.session.commit()
        return resena_schema.dump(resena), 200

    @jwt_required()
    def delete(self, id_resena):
        """Eliminar una reseña por su ID."""
        resena = Resena.query.get(id_resena)
        if not resena:
            return {"mensaje": "Resena no encontrada"}, 404

        db.session.delete(resena)
        db.session.commit()
        return {"mensaje": "Resena eliminada exitosamente"}, 200

class VistaPromociones(Resource):
    @jwt_required()
    def get(self):
        # Obtener todas las promociones y devolverlas usando el schema
        return promociones_schema.dump(Promocion.query.all()), 200

    @jwt_required()
    def post(self):
        # Crear una nueva promoción con los datos enviados en la solicitud
        nueva_promocion = Promocion(
            nombre=request.json['nombre'],  # Nombre de la promoción
            descripcion=request.json['descripcion'],  # Descripción de la promoción
            fecha_inicio=request.json['fecha_inicio'],  # Fecha de inicio de la promoción
            fecha_fin=request.json['fecha_fin'],  # Fecha de fin de la promoción
            descuento=request.json['descuento']  # Descuento de la promoción
        )
        
        # Agregar la nueva promoción a la base de datos
        db.session.add(nueva_promocion)
        try:
            db.session.commit()
            return promocion_schema.dump(nueva_promocion), 201
        except IntegrityError:
            db.session.rollback()
            return {"mensaje": "Error al crear la promoción"}, 409

class VistaPromocion(Resource):
    @jwt_required()
    def get(self, id_promocion):
        """Obtener una promoción específica por su ID."""
        promocion = Promocion.query.get(id_promocion)
        if not promocion:
            return {"mensaje": "Promoción no encontrada"}, 404
        return promocion_schema.dump(promocion), 200

    @jwt_required()
    def put(self, id_promocion):
        """Actualizar una promoción específica."""
        promocion = Promocion.query.get(id_promocion)
        if not promocion:
            return {"mensaje": "Promoción no encontrada"}, 404

        # Actualizar los campos de la promoción con los datos proporcionados
        promocion.nombre = request.json.get('nombre', promocion.nombre)
        promocion.descripcion = request.json.get('descripcion', promocion.descripcion)
        promocion.fecha_inicio = request.json.get('fecha_inicio', promocion.fecha_inicio)
        promocion.fecha_fin = request.json.get('fecha_fin', promocion.fecha_fin)
        promocion.descuento = request.json.get('descuento', promocion.descuento)

        db.session.commit()
        return promocion_schema.dump(promocion), 200

    @jwt_required()
    def delete(self, id_promocion):
        """Eliminar una promoción por su ID."""
        promocion = Promocion.query.get(id_promocion)
        if not promocion:
            return {"mensaje": "Promoción no encontrada"}, 404

        db.session.delete(promocion)
        db.session.commit()
        return {"mensaje": "Promoción eliminada exitosamente"}, 200

class VistaLogs(Resource):
    @jwt_required()
    def get(self):
        # Obtener todos los logs y devolverlos usando el schema
        return logs_schema.dump(Log.query.all()), 200

    @jwt_required()
    def post(self):
        # Crear un nuevo log con los datos enviados en la solicitud
        nuevo_log = Log(
            tipo=request.json['tipo'],  # Tipo de log
            mensaje=request.json['mensaje'],  # Mensaje del log
            usuario_id=request.json['usuario_id'],  # ID del usuario asociado al log
            fecha=request.json['fecha']  # Fecha del log
        )
        
        # Agregar el nuevo log a la base de datos
        db.session.add(nuevo_log)
        try:
            db.session.commit()
            return log_schema.dump(nuevo_log), 201
        except IntegrityError:
            db.session.rollback()
            return {"mensaje": "Error al crear el log"}, 409

class VistaLog(Resource):
    @jwt_required()
    def get(self, id_log):
        """Obtener un log específico por su ID."""
        log = Log.query.get(id_log)
        if not log:
            return {"mensaje": "Log no encontrado"}, 404
        return log_schema.dump(log), 200

    @jwt_required()
    def put(self, id_log):
        """Actualizar un log específico."""
        log = Log.query.get(id_log)
        if not log:
            return {"mensaje": "Log no encontrado"}, 404

        # Actualizar los campos del log con los datos proporcionados
        log.tipo = request.json.get('tipo', log.tipo)
        log.mensaje = request.json.get('mensaje', log.mensaje)
        log.usuario_id = request.json.get('usuario_id', log.usuario_id)
        log.fecha = request.json.get('fecha', log.fecha)

        db.session.commit()
        return log_schema.dump(log), 200

    @jwt_required()
    def delete(self, id_log):
        """Eliminar un log por su ID."""
        log = Log.query.get(id_log)
        if not log:
            return {"mensaje": "Log no encontrado"}, 404

        db.session.delete(log)
        db.session.commit()
        return {"mensaje": "Log eliminado exitosamente"}, 200


