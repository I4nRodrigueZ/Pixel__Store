from flask import request
from flask_restful import Resource
from ..modelos import db, Categoria, DetallesFactura, Reseña, Inventario, SoporteCliente, Referido, CuponPromocional
from ..schemas import CategoriaSchema, DetallesFacturaSchema, ReseñaSchema, InventarioSchema, SoporteClienteSchema, ReferidoSchema, CuponPromocionalSchema

categoria_schema = CategoriaSchema()
categorias_schema = CategoriaSchema(many=True)
detallesfactura_schema = DetallesFacturaSchema()
detallesfacturas_schema = DetallesFacturaSchema(many=True)
resena_schema = ReseñaSchema()
resenas_schema = ReseñaSchema(many=True)
inventario_schema = InventarioSchema()
inventarios_schema = InventarioSchema(many=True)
soportecliente_schema = SoporteClienteSchema()
soportescliente_schema = SoporteClienteSchema(many=True)
referido_schema = ReferidoSchema()
referidos_schema = ReferidoSchema(many=True)
cupon_schema = CuponPromocionalSchema()
cupones_schema = CuponPromocionalSchema(many=True)

# Vista para manejar todas las categorías
class VistaCategorias(Resource):
    def get(self):
        return categorias_schema.dump(Categoria.query.all())

    def post(self):
        nueva_categoria = Categoria(nombre=request.json['nombre'], descripcion=request.json.get('descripcion'))
        db.session.add(nueva_categoria)
        db.session.commit()
        return categoria_schema.dump(nueva_categoria), 201

class VistaCategoria(Resource):
    def get(self, id_categoria):
        categoria = Categoria.query.get_or_404(id_categoria)
        return categoria_schema.dump(categoria)

    def delete(self, id_categoria):
        categoria = Categoria.query.get_or_404(id_categoria)
        db.session.delete(categoria)
        db.session.commit()
        return '', 204

# Vista para manejar todos los detalles de factura
class VistaDetallesFacturas(Resource):
    def get(self):
        return detallesfacturas_schema.dump(DetallesFactura.query.all())

    def post(self):
        nuevo_detalle = DetallesFactura(
            id_factura=request.json['id_factura'],
            id_juego=request.json['id_juego'],
            cantidad=request.json['cantidad'],
            precio_unitario=request.json['precio_unitario']
        )
        db.session.add(nuevo_detalle)
        db.session.commit()
        return detallesfactura_schema.dump(nuevo_detalle), 201

class VistaDetallesFactura(Resource):
    def get(self, id_detalle):
        detalle = DetallesFactura.query.get_or_404(id_detalle)
        return detallesfactura_schema.dump(detalle)

# Vista para manejar todas las reseñas
class VistaReseñas(Resource):
    def get(self):
        return resenas_schema.dump(Reseña.query.all())

    def post(self):
        nueva_resena = Reseña(
            id_usuario=request.json['id_usuario'],
            id_juego=request.json['id_juego'],
            calificacion=request.json['calificacion'],
            comentario=request.json.get('comentario')
        )
        db.session.add(nueva_resena)
        db.session.commit()
        return resena_schema.dump(nueva_resena), 201

class VistaReseña(Resource):
    def get(self, id_resena):
        resena = Reseña.query.get_or_404(id_resena)
        return resena_schema.dump(resena)

# Vista para manejar todo el inventario
class VistaInventarios(Resource):
    def get(self):
        return inventarios_schema.dump(Inventario.query.all())

    def post(self):
        nuevo_inventario = Inventario(
            id_juego=request.json['id_juego'],
            stock_disponible=request.json['stock_disponible'],
            stock_minimo=request.json.get('stock_minimo', 0)
        )
        db.session.add(nuevo_inventario)
        db.session.commit()
        return inventario_schema.dump(nuevo_inventario), 201

class VistaInventario(Resource):
    def get(self, id_inventario):
        inventario = Inventario.query.get_or_404(id_inventario)
        return inventario_schema.dump(inventario)

# Vista para manejar el soporte al cliente
class VistaSoporteClientes(Resource):
    def get(self):
        return soportescliente_schema.dump(SoporteCliente.query.all())

    def post(self):
        nuevo_soporte = SoporteCliente(
            id_usuario=request.json['id_usuario'],
            tipo_consulta=request.json['tipo_consulta'],
            mensaje=request.json['mensaje'],
            fecha_creacion=request.json['fecha_creacion']
        )
        db.session.add(nuevo_soporte)
        db.session.commit()
        return soportecliente_schema.dump(nuevo_soporte), 201

class VistaSoporteCliente(Resource):
    def get(self, id_soporte):
        soporte = SoporteCliente.query.get_or_404(id_soporte)
        return soportecliente_schema.dump(soporte)

# Vista para manejar todos los referidos
class VistaReferidos(Resource):
    def get(self):
        return referidos_schema.dump(Referido.query.all())

    def post(self):
        nuevo_referido = Referido(
            id_usuario_referido=request.json['id_usuario_referido'],
            id_usuario_referente=request.json['id_usuario_referente'],
            fecha_referencia=request.json['fecha_referencia']
        )
        db.session.add(nuevo_referido)
        db.session.commit()
        return referido_schema.dump(nuevo_referido), 201

class VistaReferido(Resource):
    def get(self, id_referido):
        referido = Referido.query.get_or_404(id_referido)
        return referido_schema.dump(referido)

# Vista para manejar todos los cupones promocionales
class VistaCuponesPromocionales(Resource):
    def get(self):
        return cupones_schema.dump(CuponPromocional.query.all())

    def post(self):
        nuevo_cupon = CuponPromocional(
            codigo=request.json['codigo'],
            descuento=request.json['descuento'],
            fecha_expiracion=request.json['fecha_expiracion'],
            uso_maximo=request.json.get('uso_maximo', 1)
        )
        db.session.add(nuevo_cupon)
        db.session.commit()
        return cupon_schema.dump(nuevo_cupon), 201

class VistaCuponPromocional(Resource):
    def get(self, id_cupon):
        cupon = CuponPromocional.query.get_or_404(id_cupon)
        return cupon_schema.dump(cupon)

    def delete(self, id_cupon):
        cupon = CuponPromocional.query.get_or_404(id_cupon)
        db.session.delete(cupon)
        db.session.commit()
        return '', 204
