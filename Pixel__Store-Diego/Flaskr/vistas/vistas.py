from datetime import datetime, timedelta, date
from flask import request, jsonify
from flask_restful import Resource
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import joinedload
from decimal import Decimal
from flask_mail import Message
from ..extensiones import mail
from Flaskr.utils.email import enviar_correo, enviar_facturas_por_correo
import secrets
from sqlalchemy import or_, and_
from flask_jwt_extended import (
    jwt_required, create_access_token, get_jwt_identity, get_jwt
)
from ..Modelos import db,RolUsuario, Usuario, Juego, Factura, Carrito, Categoria, Divisa, Resena, Promocion, Log, DetalleFactura, DetalleCarrito
from ..Modelos import UsuarioSchema, JuegoSchema, CategoriaSchema, FacturaSchema, CarritoSchema, DivisaSchema , ResenaSchema, PromocionSchema, LogSchema, DetalleFacturaSchema, DetalleCarritoSchema

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
detalle_factura_schema = DetalleFacturaSchema()
detalle_facturas_schema = DetalleFacturaSchema(many=True)
detalle_carrito_schema = DetalleCarritoSchema()
detalle_carritos_schema = DetalleCarritoSchema(many=True)




def actualizar_total_carrito(carrito_id):
    detalles = DetalleCarrito.query.filter_by(carrito_id=carrito_id).all()
    total = sum(
        (detalle.juego.precio if detalle.juego else 0) * detalle.cantidad
        for detalle in detalles
    )
    carrito = Carrito.query.get(carrito_id)
    carrito.total = total
    db.session.commit()
    
# ⬇️ ESTA ES LA FUNCIÓN QUE VA ARRIBA EN EL MISMO ARCHIVO
def decimal_to_float(obj):
    if isinstance(obj, dict):
        return {k: float(v) if isinstance(v, Decimal) else v for k, v in obj.items()}
    elif isinstance(obj, list):
        return [decimal_to_float(i) for i in obj]
    return obj


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
        email = request.json.get("email")
        contrasena = request.json.get("contrasena")

        # Buscar el usuario por email
        usuario = Usuario.query.filter_by(email=email).first()

        # Verificar credenciales
        if usuario and usuario.verificar_contrasena(contrasena):
            # Crear el token JWT
            token_de_acceso = create_access_token(
                identity=str(usuario.id),  # ID del usuario como identidad del token
                additional_claims={"rol": usuario.rol.value}
            )

            # Verificar si el usuario ya tiene un carrito
            if not usuario.carrito:
                nuevo_carrito = Carrito(usuario_id=usuario.id, total=0.0)
                db.session.add(nuevo_carrito)
                db.session.commit()

            # Respuesta que incluye ID, rol y token
            return {
                "mensaje": "Inicio de sesión exitoso",
                "token": token_de_acceso,
                "rol": usuario.rol.value,
                "id_usuario": usuario.id  # Aquí se incluye el ID del usuario en la respuesta
            }, 200

        return {"mensaje": "Usuario o contraseña incorrectos"}, 401




class VistaProtegida(Resource):
    @jwt_required()
    def get(self):
        usuario_actual = get_jwt_identity()
        return {"mensaje": f"Bienvenido {usuario_actual}"}, 200

class VistaUsuarios(Resource):
    @jwt_required()
    def get(self):
        return usuarios_schema.dump(Usuario.query.all()), 200


    def post(self):
        try:
            nuevo_usuario = Usuario(
                nombre=request.json['nombre'],
                apellido=request.json['apellido'],  # Campo adicional
                email=request.json['email'],
                contrasena=request.json['contrasena'],
                fecha_registro=request.json['fecha_registro'],
                rol=RolUsuario(request.json['rol']),  # Convertir rol a Enum
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
    def get(self):
        """Obtener todos los juegos o filtrar por término de búsqueda y otros filtros."""
        search_term = request.args.get('q')
        min_price = request.args.get('min_price')
        max_price = request.args.get('max_price')
        category_id = request.args.get('category_id')
        in_stock = request.args.get('in_stock')

        query = Juego.query

        if search_term:
            query = query.filter(Juego.titulo.ilike(f'%{search_term}%')) 

        if min_price and min_price.replace('.', '', 1).isdigit():
            query = query.filter(Juego.precio >= float(min_price))
        if max_price and max_price.replace('.', '', 1).isdigit():
            query = query.filter(Juego.precio <= float(max_price))

        if category_id and category_id.isdigit():
            query = query.filter(Juego.categoria_id == int(category_id))

        if in_stock and in_stock.lower() == 'true':
            query = query.filter(Juego.stock > 0)

        juegos = query.all()
        return juegos_schema.dump(juegos), 200  

    @jwt_required()
    def post(self):
        """Crear un nuevo juego asociado al usuario autenticado."""
        usuario_id = get_jwt_identity()  # 🟢 Aquí obtenemos el ID del usuario del token

        nuevo_juego = Juego(
            titulo=request.json['titulo'],
            descripcion=request.json.get('descripcion', ''),
            precio=request.json['precio'],
            stock=request.json.get('stock', 0),
            condicion=request.json['condicion'],
            categoria_id=request.json['id_categoria'],
            imagen_url=request.json.get('imagen_url', ''),
            usuario_id=usuario_id  # 🟢 Asignamos el usuario que crea el juego
        )
        db.session.add(nuevo_juego)
        db.session.commit()
        return juego_schema.dump(nuevo_juego), 201

class VistaJuego(Resource):
    def get(self, id_juego):
        """Obtener un juego por su ID."""
        juego = Juego.query.get_or_404(id_juego)
        
        # Calcular el precio con descuento
        precio_con_descuento = juego.calcular_precio_con_descuento()

        # Devolver los datos del juego, incluyendo el precio con descuento
        juego_data = juego_schema.dump(juego)
        juego_data['precio_con_descuento'] = precio_con_descuento  # Agregar el precio con descuento
        
        return juego_data, 200

    @jwt_required()
    def put(self, id_juego):
        """Actualizar un juego existente."""
        juego = Juego.query.get_or_404(id_juego)
        juego.titulo = request.json.get('titulo', juego.titulo)
        juego.descripcion = request.json.get('descripcion', juego.descripcion)
        juego.precio = request.json.get('precio', juego.precio)
        juego.stock = request.json.get('stock', juego.stock)
        juego.condicion = request.json.get('condicion', juego.condicion)
        juego.categoria_id = request.json.get('id_categoria', juego.categoria_id)  # Actualizamos 'categoria_id'
        juego.imagen_url = request.json.get('imagen_url', juego.imagen_url)
        db.session.commit()
        return juego_schema.dump(juego), 200

    @jwt_required()
    def delete(self, id_juego):
        """Eliminar un juego por su ID."""
        juego = Juego.query.get_or_404(id_juego)
        db.session.delete(juego)
        db.session.commit()
        return '', 204

class VistaJuegosUsuarioActual(Resource):
    @jwt_required()
    def get(self):
        usuario_id = get_jwt_identity()  # Obtén el ID del usuario desde el JWT
        rol = get_jwt().get("rol")  # Obtén el rol del usuario desde el JWT
        
        if rol == "admin":
            # Si el usuario es admin, devolver todos los juegos
            juegos_usuario = Juego.query.all()
        else:
            # Si no es admin, devolver solo los juegos asociados al usuario
            juegos_usuario = Juego.query.filter_by(usuario_id=usuario_id).all()

        return juegos_schema.dump(juegos_usuario), 200


class VistaCategoria(Resource):
    def get(self, id_categoria):
        """Obtener una categoría específica por su ID."""
        categoria = Categoria.query.get(id_categoria)
        if not categoria:
            return {"mensaje": "Categoría no encontrada"}, 404
        return categoria_schema.dump(categoria), 200
    @jwt_required()
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
    @jwt_required()
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
    @jwt_required()
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
        """Obtener todas las facturas (admin ve todas, usuario normal solo las suyas)"""
        try:
            usuario_id = get_jwt_identity()
            es_admin = get_jwt().get('rol') == 'admin'

            query = Factura.query
            if not es_admin:
                query = query.filter_by(usuario_id=usuario_id)

            facturas = query.order_by(Factura.fecha.desc()).all()
            resultado = []

            for factura in facturas:
                detalles_serializados = []
                for d in factura.detalles:
                    detalles_serializados.append({
                        "juego_id": d.juego_id,
                        "juego": {
                            "id": d.juego.id,
                            "titulo": d.juego.titulo,
                            "precio": d.juego.precio,
                            "imagen": d.juego.imagen_url  # le metemos también imagen si quieres
                        },
                        "cantidad": d.cantidad,
                        "subtotal": round(d.cantidad * d.juego.precio, 2)
                    })

                resultado.append({
                    "id": factura.id,
                    "usuario_id": factura.usuario_id,
                    "divisa": factura.divisa_id,
                    "fecha": factura.fecha.isoformat(),
                    "metodo_pago": factura.metodo_pago,
                    "monto_subtotal": factura.monto_subtotal,  # ✅ CAMBIADO AQUÍ
                    "impuestos": factura.impuestos,
                    "total": factura.total,
                    "detalles": detalles_serializados
                })

            return jsonify(resultado)

        except Exception as e:
            return {
                "mensaje": "Error al obtener facturas",
                "error": str(e)
            }, 500



    @jwt_required()
    def post(self):
        data = request.get_json()
        usuario_id = get_jwt_identity()

        monto_subtotal = data.get("monto_subtotal")
        impuestos = data.get("impuestos")
        total = data.get("total")
        metodo_pago = data.get("metodo_pago")
        divisa_id = data.get("divisa_id")
        detalles = data.get("detalles")

        if not all([monto_subtotal, impuestos, total, metodo_pago, divisa_id, detalles]):
            return {"mensaje": "Faltan datos para crear la factura"}, 400

        nueva_factura = Factura(
            usuario_id=usuario_id,
            monto_subtotal=monto_subtotal,
            impuestos=impuestos,
            total=total,
            metodo_pago=metodo_pago,
            divisa_id=divisa_id
        )
        db.session.add(nueva_factura)
        db.session.flush()  # Se asegura de tener el ID antes de insertar detalles

        for item in detalles:
            detalle = DetalleFactura(
                factura_id=nueva_factura.id,
                juego_id=item['juego_id'],
                cantidad=item['cantidad']
            )
            db.session.add(detalle)

        db.session.commit()

        return {
            "mensaje": "Factura creada correctamente",
            "factura_id": nueva_factura.id
        }, 201


class VistaFactura(Resource):

    @jwt_required()
    def get(self, id_factura):
        factura = Factura.query.get(id_factura)
        if not factura:
            return {"mensaje": "Factura no encontrada"}, 404

        detalles = []
        for detalle in factura.detalles:
            juego = Juego.query.get(detalle.juego_id)
            if juego:
                detalles.append({
                    "juego": {
                        "id": juego.id,
                        "nombre": juego.titulo,
                        "precio_original": juego.precio,
                        "precio_con_descuento": juego.calcular_precio_con_descuento()
                    },
                    "cantidad": detalle.cantidad,
                    "subtotal": detalle.cantidad * juego.calcular_precio_con_descuento()
                })

        divisa_nombre = factura.divisa.nombre if factura.divisa else "USD"

        return {
            "id": factura.id,
            "fecha": factura.fecha.strftime('%Y-%m-%d %H:%M:%S'),
            "metodo_pago": factura.metodo_pago,
            "divisa": divisa_nombre,
            "subtotal": factura.monto_subtotal,
            "impuestos": factura.impuestos,
            "total": factura.total,
            "usuario_id": factura.usuario_id,
            "detalles": detalles
        }, 200

    @jwt_required()
    def put(self, id_factura):
        factura = Factura.query.get(id_factura)
        if not factura:
            return {"mensaje": "Factura no encontrada"}, 404

        data = request.get_json()

        factura.fecha = data.get('fecha', factura.fecha)
        factura.monto_subtotal = data.get('monto_subtotal', factura.monto_subtotal)
        factura.impuestos = data.get('impuestos', factura.impuestos)
        factura.total = data.get('total', factura.total)
        factura.metodo_pago = data.get('metodo_pago', factura.metodo_pago)
        factura.divisa_id = data.get('divisa_id', factura.divisa_id)
        factura.usuario_id = data.get('usuario_id', factura.usuario_id)

        db.session.commit()
        return {"mensaje": "Factura actualizada correctamente"}, 200

    @jwt_required()
    def delete(self, id_factura):
        factura = Factura.query.get(id_factura)
        if not factura:
            return {"mensaje": "Factura no encontrada"}, 404

        for detalle in factura.detalles:
            db.session.delete(detalle)

        db.session.delete(factura)
        db.session.commit()
        return {"mensaje": "Factura eliminada exitosamente"}, 200


class VistaDetalleFactura(Resource):

    @jwt_required()
    def get(self):
        return detalle_facturas_schema.dump(DetalleFactura.query.all()), 200

    @jwt_required()
    def put(self, id_detalle):
        detalle = DetalleFactura.query.get_or_404(id_detalle)
        nueva_cantidad = request.json.get("cantidad")

        if nueva_cantidad is not None and nueva_cantidad > 0:
            detalle.cantidad = nueva_cantidad
            db.session.commit()
            return detalle_factura_schema.dump(detalle), 200

        return {"mensaje": "Debe proporcionar una cantidad válida"}, 400

    @jwt_required()
    def delete(self, id_detalle):
        detalle = DetalleFactura.query.get_or_404(id_detalle)
        db.session.delete(detalle)
        db.session.commit()
        return {"mensaje": "Juego eliminado de la factura"}, 200


class VistaGenerarFactura(Resource):

    @jwt_required()
    def post(self):
        usuario_id = get_jwt_identity()
        usuario = Usuario.query.get(usuario_id)

        if not usuario:
            return {'mensaje': 'Usuario no encontrado'}, 404

        detalles_carrito = DetalleCarrito.query.filter_by(carrito_id=usuario.carrito.id).all()
        if not detalles_carrito:
            return {'mensaje': 'El carrito está vacío'}, 400

        subtotal = sum(dc.juego.calcular_precio_con_descuento() * dc.cantidad for dc in detalles_carrito)
        impuestos = round(subtotal * 0.19, 2)
        total = round(subtotal + impuestos, 2)

        nueva_factura = Factura(
            usuario_id=usuario_id,
            monto_subtotal=subtotal,
            impuestos=impuestos,
            total=total,
            metodo_pago=request.json.get('metodo_pago', 'Nequi'),
            divisa_id=request.json.get('divisa_id', 1),
            fecha=datetime.utcnow()
        )

        db.session.add(nueva_factura)
        db.session.flush()

        juegos_info = []

        for item in detalles_carrito:
            juego = Juego.query.get(item.juego_id)
            if not juego or juego.stock < item.cantidad:
                return {'mensaje': f'Stock insuficiente para el juego {juego.titulo}'}, 400

            detalle_factura = DetalleFactura(
                factura_id=nueva_factura.id,
                juego_id=item.juego_id,
                cantidad=item.cantidad
            )
            db.session.add(detalle_factura)

            juego.stock -= item.cantidad
            juegos_info.append({
                'juego': juego.titulo,
                'cantidad': item.cantidad,
                'precio_unitario': juego.calcular_precio_con_descuento()
            })

        for item in detalles_carrito:
            db.session.delete(item)

        db.session.commit()

        divisa = Divisa.query.get(nueva_factura.divisa_id)
        factura_dict = {
            'id': nueva_factura.id,
            'total': nueva_factura.total,
            'divisa': divisa.nombre if divisa else 'USD',
            'fecha': nueva_factura.fecha.strftime('%Y-%m-%d'),
            'juegos': juegos_info
        }

        enviar_facturas_por_correo(usuario.email, [factura_dict])

        return {
            'mensaje': 'Factura generada, stock actualizado y correo enviado exitosamente',
            'factura_id': nueva_factura.id
        }, 201



# Carritos
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
        db.session.flush()

        for detalle in request.json.get('detalle_carrito', []):
            nuevo_detalle = DetalleCarrito(
                carrito_id=nuevo_carrito.id,
                juego_id=detalle['juego_id'],
                cantidad=detalle['cantidad']
            )
            db.session.add(nuevo_detalle)

        db.session.commit()
        return carrito_schema.dump(nuevo_carrito), 201

class VistaCarrito(Resource):
    @jwt_required()
    def get(self, id_carrito):
        carrito = Carrito.query.get_or_404(id_carrito)
        return carrito_schema.dump(carrito), 200

    @jwt_required()
    def delete(self, id_carrito):
        DetalleCarrito.query.filter_by(carrito_id=id_carrito).delete()
        carrito = Carrito.query.get_or_404(id_carrito)
        db.session.delete(carrito)
        db.session.commit()
        return '', 204

# Detalle Carrito
class VistaDetalleCarrito(Resource):
    @jwt_required()
    def get(self):
        return detalle_carritos_schema.dump(DetalleCarrito.query.all()), 200

    @jwt_required()
    def put(self, id_detalle):
        detalle = DetalleCarrito.query.get_or_404(id_detalle)
        nueva_cantidad = request.json.get("cantidad")
        if nueva_cantidad is not None:
            detalle.cantidad = nueva_cantidad
            db.session.commit()
            return detalle_carrito_schema.dump(detalle), 200
        return {"mensaje": "Debe proporcionar una cantidad válida"}, 400

    @jwt_required()
    def delete(self, id_detalle):
        detalle = DetalleCarrito.query.get_or_404(id_detalle)
        db.session.delete(detalle)
        db.session.commit()
        return {"mensaje": "Juego eliminado del carrito"}, 200
    

class VistaAgregarAlCarrito(Resource):
    @jwt_required()
    def post(self):
        usuario_id = get_jwt_identity()
        datos = request.json
        juego_id = datos.get("juego_id")
        cantidad = datos.get("cantidad", 1)

        # Obtén el carrito del usuario
        carrito = Carrito.query.filter_by(usuario_id=usuario_id).first()
        if not carrito:
            return {"mensaje": "Carrito no encontrado"}, 404

        # Obtén el juego
        juego = Juego.query.get(juego_id)
        if not juego:
            return {"mensaje": "Juego no encontrado"}, 404

        # Calcula el precio con descuento
        precio_con_descuento = juego.calcular_precio_con_descuento()

        # Revisa si ya existe un detalle del juego en el carrito
        detalle = DetalleCarrito.query.filter_by(carrito_id=carrito.id, juego_id=juego_id).first()
        if detalle:
            detalle.cantidad += cantidad  # Si ya está en el carrito, solo actualiza la cantidad
        else:
            nuevo_detalle = DetalleCarrito(
                carrito_id=carrito.id,
                juego_id=juego_id,
                cantidad=cantidad,
                precio_con_descuento=precio_con_descuento  # Guarda el precio con descuento
            )
            db.session.add(nuevo_detalle)

        carrito.calcular_total()  # Si ya tienes una función que recalcula el total del carrito
        db.session.commit()

        return {"mensaje": "Juego agregado al carrito exitosamente"}, 200




class VistaEditarCantidadCarrito(Resource):
    @jwt_required()
    def put(self):
        usuario_id = get_jwt_identity()
        datos = request.json
        juego_id = datos.get("juego_id")
        nueva_cantidad = datos.get("cantidad")

        carrito = Carrito.query.filter_by(usuario_id=usuario_id).first()
        if not carrito:
            return {"mensaje": "Carrito no encontrado"}, 404

        detalle = DetalleCarrito.query.filter_by(carrito_id=carrito.id, juego_id=juego_id).first()
        if not detalle:
            return {"mensaje": "Juego no encontrado en el carrito"}, 404

        detalle.cantidad = nueva_cantidad
        carrito.calcular_total()
        db.session.commit()
        return {"mensaje": "Cantidad actualizada correctamente"}, 200


class VistaEliminarDelCarrito(Resource):
    @jwt_required()
    def delete(self, juego_id):
        usuario_id = get_jwt_identity()
        carrito = Carrito.query.filter_by(usuario_id=usuario_id).first()
        if not carrito:
            return {"mensaje": "Carrito no encontrado"}, 404

        detalle = DetalleCarrito.query.filter_by(carrito_id=carrito.id, juego_id=juego_id).first()
        if not detalle:
            return {"mensaje": "Juego no encontrado en el carrito"}, 404

        db.session.delete(detalle)
        carrito.calcular_total()
        db.session.commit()
        return {"mensaje": "Juego eliminado del carrito"}, 200


from datetime import date
from flask_jwt_extended import jwt_required, get_jwt_identity

class VistaCarritoUsuarioActual(Resource):
    @jwt_required()
    def get(self):
        usuario_id = get_jwt_identity()
        carrito = Carrito.query.filter_by(usuario_id=usuario_id).first()

        if not carrito:
            return {"mensaje": "Carrito no encontrado"}, 404

        detalles = DetalleCarrito.query.filter_by(carrito_id=carrito.id).all()
        resultado = []
        total = 0.0

        for detalle in detalles:
            juego = Juego.query.get(detalle.juego_id)
            if not juego:
                continue  # Ignorar juegos que ya no existen

            precio_unitario = float(juego.precio)
            cantidad = detalle.cantidad
            subtotal = precio_unitario * cantidad
            descuentos_aplicados = []

            # Aplicar promociones vigentes por juego
            promociones_juego = getattr(juego, 'promociones', [])
            for promocion in promociones_juego:
                if promocion and promocion.esta_activa():
                    if promocion.tipo_descuento == 'Porcentaje':
                        descuento = subtotal * (float(promocion.valor_descuento) / 100)
                    elif promocion.tipo_descuento == 'Monto_Fijo':
                        descuento = float(promocion.valor_descuento)
                    else:
                        descuento = 0

                    subtotal -= descuento  # Aplica descuento solo al subtotal
                    descuentos_aplicados.append({
                        "descuento": round(float(descuento), 2),
                        "tipo": promocion.tipo_descuento,
                        "valor": float(promocion.valor_descuento)
                    })

            total += subtotal  # Sumar subtotal ya con descuentos aplicados

            resultado.append({
                "juego_id": juego.id,
                "titulo": juego.titulo,
                "precio_unitario": precio_unitario,
                "cantidad": cantidad,
                "subtotal": round(subtotal, 2),
                "imagen_url": juego.imagen_url,
                "descuentos": descuentos_aplicados
            })

        # Aplicar promoción global vigente filtrando por fechas
        hoy = date.today()
        promocion_global = Promocion.query.filter(
            Promocion.es_global == True,
            Promocion.fecha_inicio <= hoy,
            Promocion.fecha_fin >= hoy
        ).first()

        descuento_global_aplicado = 0.0
        if promocion_global:
            if promocion_global.tipo_descuento == 'Porcentaje':
                descuento_global_aplicado = total * (float(promocion_global.valor_descuento) / 100)
            elif promocion_global.tipo_descuento == 'Monto_Fijo':
                descuento_global_aplicado = float(promocion_global.valor_descuento)

            total -= descuento_global_aplicado

        total_con_descuento = round(total, 2)

        return {
            "carrito_id": carrito.id,
            "usuario_id": carrito.usuario_id,
            "juegos": resultado,
            "total": total_con_descuento,
            "descuento_global_aplicado": round(descuento_global_aplicado, 2)
        }, 200


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
            tipo_cambio=request.json['tipo_cambio']  # Tasa de cambio
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
        divisa.tasa_cambio = request.json.get('tipo_cambio', divisa.tasa_cambio)

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
    def get(self):
        """Obtener reseñas (público) con filtros y paginación"""
        try:
            juego_id = request.args.get('juego_id')
            usuario_id = request.args.get('usuario_id')
            pagina = request.args.get('pagina', 1, type=int)
            por_pagina = request.args.get('por_pagina', 10, type=int)
            
            query = Resena.query.order_by(Resena.fecha.desc())
            
            if juego_id:
                query = query.filter_by(juego_id=juego_id)
            if usuario_id:
                query = query.filter_by(usuario_id=usuario_id)
                
            resenas_paginadas = query.paginate(
                page=pagina, 
                per_page=por_pagina,
                error_out=False
            )
            
            return {
                'resenas': resenas_schema.dump(resenas_paginadas.items),
                'total': resenas_paginadas.total,
                'paginas': resenas_paginadas.pages,
                'pagina_actual': pagina
            }, 200
            
        except Exception as e:
            return {
                "mensaje": "Error al obtener reseñas",
                "error": str(e)
            }, 500

    @jwt_required()
    def post(self):
        """Crear nueva reseña (requiere autenticación)"""
        try:
            current_user_id = get_jwt_identity()
            claims = get_jwt()
            es_admin = claims.get('rol') == 'admin'
            
            data = request.get_json()
            
            # Validación básica
            if not data:
                return {"mensaje": "No se proporcionaron datos"}, 400
                
            # Validación de campos requeridos
            required_fields = ['comentario', 'puntuacion', 'juego_id']
            if not all(field in data for field in required_fields):
                return {
                    "mensaje": "Faltan campos requeridos",
                    "campos_requeridos": required_fields
                }, 400

            # Validación de tipos
            try:
                juego_id = int(data['juego_id'])
                puntuacion = int(data['puntuacion'])
            except (ValueError, TypeError):
                return {"mensaje": "juego_id y puntuacion deben ser números válidos"}, 400

            # Validación de contenido
            comentario = data['comentario'].strip()
            if len(comentario) < 10:
                return {"mensaje": "El comentario debe tener al menos 10 caracteres"}, 400
                
            if not 1 <= puntuacion <= 5:
                return {"mensaje": "La puntuación debe estar entre 1 y 5"}, 400
                
            # Determinar usuario_id
            usuario_id = data.get('usuario_id') if es_admin else current_user_id
            
            # Verificar reseña existente (solo para no admins)
            if not es_admin:
                existe_resena = Resena.query.filter_by(
                    usuario_id=usuario_id,
                    juego_id=juego_id
                ).first()
                
                if existe_resena:
                    return {
                        "mensaje": "Ya has creado una reseña para este juego",
                        "resena_existente": resena_schema.dump(existe_resena)
                    }, 409
            
            # Crear nueva reseña (sin pasar editada, usará el valor por defecto)
            nueva_resena = Resena(
                comentario=comentario,
                puntuacion=puntuacion,
                usuario_id=usuario_id,
                juego_id=juego_id
            )
            
            db.session.add(nueva_resena)
            db.session.commit()
            
            return resena_schema.dump(nueva_resena), 201
            
        except IntegrityError as e:
            db.session.rollback()
            return {
                "mensaje": "Error de integridad en la base de datos",
                "error": str(e)
            }, 409
        except Exception as e:
            db.session.rollback()
            return {
                "mensaje": "Error al crear reseña",
                "error": str(e)
            }, 500

class VistaResena(Resource):
    @jwt_required(optional=True)
    def get(self, id_resena):
        """Obtener una reseña específica (pública o privada si es del usuario/admin)"""
        try:
            resena = Resena.query.get_or_404(id_resena)
            current_user_id = get_jwt_identity()
            claims = get_jwt() or {}
            es_admin = claims.get('rol') == 'admin'
            
            # Mostrar info completa si es admin o dueño
            if current_user_id and (resena.usuario_id == current_user_id or es_admin):
                return resena_schema.dump(resena), 200
                
            # Para otros usuarios, mostrar versión pública
            return {
                'id': resena.id,
                'puntuacion': resena.puntuacion,
                'comentario': resena.comentario,
                'fecha': resena.fecha.isoformat(),
                'juego_id': resena.juego_id,
                'usuario': {
                    'id': resena.usuario.id,
                    'nombre': resena.usuario.nombre
                }
            }, 200
            
        except Exception as e:
            return {
                "mensaje": "Error al obtener la reseña",
                "error": str(e)
            }, 404

    @jwt_required()
    def put(self, id_resena):
        """Actualizar una reseña (dueño o admin)"""
        try:
            resena = Resena.query.get_or_404(id_resena)
            current_user_id = get_jwt_identity()
            claims = get_jwt()
            es_admin = claims.get('rol') == 'admin'
            data = request.get_json()
            
            # Verificar permisos
            if resena.usuario_id != current_user_id and not es_admin:
                return {
                    "mensaje": "No autorizado para editar esta reseña"
                }, 403
                
            # Validaciones
            if 'comentario' in data:
                if not isinstance(data['comentario'], str) or len(data['comentario'].strip()) < 10:
                    return {
                        "mensaje": "El comentario debe tener al menos 10 caracteres"
                    }, 400
                resena.comentario = data['comentario'].strip()
                
            if 'puntuacion' in data:
                try:
                    puntuacion = int(data['puntuacion'])
                    if not 1 <= puntuacion <= 5:
                        return {"mensaje": "La puntuación debe estar entre 1 y 5"}, 400
                    resena.puntuacion = puntuacion
                except (ValueError, TypeError):
                    return {"mensaje": "La puntuación debe ser un número válido"}, 400
            
            # Manejo seguro del campo editada
            if 'editada' in data:
                # Conversión segura a booleano
                if isinstance(data['editada'], str):
                    resena.editada = data['editada'].lower() in ('true', '1', 't')
                else:
                    resena.editada = bool(data['editada'])
            
            # Marcar como editada (solo si no es admin para tracking)
            if not es_admin:
                resena.editada = True
                resena.fecha_edicion = datetime.utcnow()
            else:
                resena.editada_por_admin = True
                resena.admin_editor_id = current_user_id
                resena.fecha_edicion = datetime.utcnow()
            
            db.session.commit()
            
            return resena_schema.dump(resena), 200
            
        except Exception as e:
            db.session.rollback()
            return {
                "mensaje": "Error al actualizar la reseña",
                "error": str(e)
            }, 500

    @jwt_required()
    def delete(self, id_resena):
        """Eliminar una reseña (dueño o admin)"""
        try:
            resena = Resena.query.get_or_404(id_resena)
            current_user_id = get_jwt_identity()
            claims = get_jwt()
            es_admin = claims.get('rol') == 'admin'
            
            # Verificar permisos
            if resena.usuario_id != current_user_id and not es_admin:
                return {
                    "mensaje": "No autorizado para eliminar esta reseña"
                }, 403
                
            # Registrar quién eliminó (admin o usuario)
            if es_admin:
                # Opcional: Guardar registro de eliminación por admin
                pass
                
            db.session.delete(resena)
            db.session.commit()
            
            return {
                "mensaje": "Reseña eliminada exitosamente",
                "id": id_resena,
                "eliminado_por_admin": es_admin
            }, 200
            
        except Exception as e:
            db.session.rollback()
            return {
                "mensaje": "Error al eliminar la reseña",
                "error": str(e)
            }, 500
            
class VistaPromociones(Resource):
    
    def get(self):
        promociones = Promocion.query.options(joinedload(Promocion.juegos)).all()
        return promociones_schema.dump(promociones), 200

    @jwt_required()
    def post(self):
        nueva_promocion = Promocion(
            nombre=request.json['nombre'],
            tipo_descuento=request.json['tipo_descuento'],
            valor_descuento=request.json['valor_descuento'],
            fecha_inicio=request.json['fecha_inicio'],
            fecha_fin=request.json['fecha_fin'],
            es_global=request.json.get('es_global', False)
        )

        db.session.add(nueva_promocion)
        
        # Asociar juegos si no es global
        if not nueva_promocion.es_global and 'juegos_ids' in request.json:
            for id_juego in request.json['juegos_ids']:
                juego = Juego.query.get(id_juego)
                if juego:
                    nueva_promocion.juegos.append(juego)

        try:
            db.session.commit()
            return promocion_schema.dump(nueva_promocion), 201
        except IntegrityError:
            db.session.rollback()
            return {"mensaje": "Error al crear la promoción"}, 409

class VistaPromocion(Resource):
    
    def get(self, id_promocion):
        promocion = Promocion.query.options(joinedload(Promocion.juegos)).get(id_promocion)
        if not promocion:
            return {"mensaje": "Promoción no encontrada"}, 404
        return promocion_schema.dump(promocion), 200

    @jwt_required()
    def put(self, id_promocion):
        promocion = Promocion.query.options(joinedload(Promocion.juegos)).get(id_promocion)
        if not promocion:
            return {"mensaje": "Promoción no encontrada"}, 404

        promocion.nombre = request.json.get('nombre', promocion.nombre)
        promocion.tipo_descuento = request.json.get('tipo_descuento', promocion.tipo_descuento)
        promocion.valor_descuento = request.json.get('valor_descuento', promocion.valor_descuento)
        promocion.fecha_inicio = request.json.get('fecha_inicio', promocion.fecha_inicio)
        promocion.fecha_fin = request.json.get('fecha_fin', promocion.fecha_fin)
        promocion.es_global = request.json.get('es_global', promocion.es_global)

        # Actualizar juegos asociados
        if not promocion.es_global and 'juegos_ids' in request.json:
            promocion.juegos = []
            for id_juego in request.json['juegos_ids']:
                juego = Juego.query.get(id_juego)
                if juego:
                    promocion.juegos.append(juego)

        try:
            db.session.commit()
            return promocion_schema.dump(promocion), 200
        except IntegrityError:
            db.session.rollback()
            return {"mensaje": "Error al actualizar la promoción"}, 409

    @jwt_required()
    def delete(self, id_promocion):
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


# 💌 Recuperación de contraseña
class VistaForgotPassword(Resource):
    def post(self):
        email = request.json.get('email')
        usuario = Usuario.query.filter_by(email=email).first()
        if not usuario:
            return {'mensaje': 'El correo no está registrado.'}, 404

        token = secrets.token_urlsafe(32)
        usuario.reset_token = token
        usuario.reset_token_expiration = datetime.utcnow() + timedelta(hours=1)
        db.session.commit()

        enlace = f"http://localhost:5173/reset-password/{token}"
        mensaje = Message('Recuperación de contraseña',
                          recipients=[email])
        mensaje.body = f"""🎮 ¡Hola {usuario.nombre}!

Recibimos una solicitud para restablecer la contraseña de tu cuenta en Pixel Store.

🔗 Enlace para restablecer tu contraseña:
{enlace}

Este enlace es válido por 1 hora. Si no solicitaste este cambio, puedes ignorar este mensaje con tranquilidad: tu cuenta sigue segura 🛡️.

Gracias por confiar en nosotros,
— El equipo de QuantumLeap | Pixel Store ✨
"""


        mail.send(mensaje)
        return {'mensaje': 'Correo de recuperación enviado.'}, 200
class VistaResetPassword(Resource):
    def post(self, token):
        nueva_contrasena = request.json.get('contrasena')
        usuario = Usuario.query.filter_by(reset_token=token).first()
        if not usuario:
            return {'mensaje': 'Token inválido o expirado'}, 400

        usuario.contrasena = nueva_contrasena
        usuario.reset_token = None
        usuario.reset_token_expiration = None
        db.session.commit()
        return {'mensaje': 'Contraseña actualizada con éxito.'}, 200
    
# 🧍‍♂️ Enviar a un solo destinatario (requiere campo 'destinatario')
class VistaNotificarAdmin(Resource):
    def post(self):
        data = request.get_json()
        asunto = data.get("asunto", "Notificación desde Pixel Store")
        mensaje = data.get("mensaje", "Este es un mensaje predeterminado para los usuarios.")
        destinatario = data.get("destinatario", None)

        if not destinatario:
            return {"error": "Debes proporcionar un destinatario."}, 400

        try:
            enviar_correo(destinatario, asunto, mensaje)
            return {"mensaje": "Correo enviado correctamente a un usuario."}, 200
        except Exception as e:
            return {"error": str(e)}, 500


# 👥 Enviar a todos los usuarios
class VistaNotificarTodos(Resource):
    def post(self):
        data = request.get_json()
        asunto = data.get("asunto", "Notificación para todos desde Pixel Store")
        mensaje = data.get("mensaje", "Este es un mensaje general para todos los usuarios.")

        try:
            usuarios = Usuario.query.with_entities(Usuario.email).all()
            enviados = 0
            for usuario in usuarios:
                if usuario.email:
                    enviar_correo(usuario.email, asunto, mensaje)
                    enviados += 1
            return {"mensaje": f"Correos enviados a {enviados} usuarios."}, 200
        except Exception as e:
            return {"error": str(e)}, 500
        
