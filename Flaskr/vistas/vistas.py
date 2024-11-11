from flask import Flask, request, jsonify, abort
from modelos import db, Usuario, Juego, Factura  # Importa tus modelos aquí

app = Flask(__name__)
app.config['SQLALCHEMY_DATABASE_URI'] = 'mysql+pymysql://username:password@localhost/QuantumLeap'  # Ajusta tu configuración
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
db.init_app(app)

### Vistas para la Entidad Usuario ###

@app.route('/usuarios', methods=['POST'])
def crear_usuario():
    data = request.json
    nuevo_usuario = Usuario(
        nombre=data['nombre'],
        apellido=data['apellido'],
        email=data['email'],
        contraseña=data['contraseña'],
        fecha_registro=data['fecha_registro'],
        direccion=data.get('direccion'),
        telefono=data.get('telefono'),
        id_rol=data.get('id_rol')
    )
    db.session.add(nuevo_usuario)
    db.session.commit()
    return jsonify({"mensaje": "Usuario creado exitosamente", "usuario_id": nuevo_usuario.id_usuario}), 201

@app.route('/usuarios/<int:id_usuario>', methods=['GET'])
def obtener_usuario(id_usuario):
    usuario = Usuario.query.get_or_404(id_usuario)
    return jsonify({
        "id_usuario": usuario.id_usuario,
        "nombre": usuario.nombre,
        "apellido": usuario.apellido,
        "email": usuario.email,
        "fecha_registro": usuario.fecha_registro.isoformat(),
        "direccion": usuario.direccion,
        "telefono": usuario.telefono,
        "id_rol": usuario.id_rol
    })

@app.route('/usuarios/<int:id_usuario>', methods=['PUT'])
def actualizar_usuario(id_usuario):
    usuario = Usuario.query.get_or_404(id_usuario)
    data = request.json
    usuario.nombre = data.get('nombre', usuario.nombre)
    usuario.apellido = data.get('apellido', usuario.apellido)
    usuario.email = data.get('email', usuario.email)
    usuario.contraseña = data.get('contraseña', usuario.contraseña)
    usuario.direccion = data.get('direccion', usuario.direccion)
    usuario.telefono = data.get('telefono', usuario.telefono)
    usuario.id_rol = data.get('id_rol', usuario.id_rol)
    db.session.commit()
    return jsonify({"mensaje": "Usuario actualizado exitosamente"})

@app.route('/usuarios/<int:id_usuario>', methods=['DELETE'])
def eliminar_usuario(id_usuario):
    usuario = Usuario.query.get_or_404(id_usuario)
    db.session.delete(usuario)
    db.session.commit()
    return jsonify({"mensaje": "Usuario eliminado exitosamente"})

### Vistas para la Entidad Juego ###

@app.route('/juegos', methods=['POST'])
def crear_juego():
    data = request.json
    nuevo_juego = Juego(
        nombre_juego=data['nombre_juego'],
        descripcion=data.get('descripcion'),
        precio=data['precio'],
        stock=data.get('stock', 0),
        condicion=data['condicion'],
        id_categoria=data.get('id_categoria')
    )
    db.session.add(nuevo_juego)
    db.session.commit()
    return jsonify({"mensaje": "Juego creado exitosamente", "juego_id": nuevo_juego.id_juego}), 201

@app.route('/juegos/<int:id_juego>', methods=['GET'])
def obtener_juego(id_juego):
    juego = Juego.query.get_or_404(id_juego)
    return jsonify({
        "id_juego": juego.id_juego,
        "nombre_juego": juego.nombre_juego,
        "descripcion": juego.descripcion,
        "precio": str(juego.precio),
        "stock": juego.stock,
        "condicion": juego.condicion,
        "id_categoria": juego.id_categoria
    })

@app.route('/juegos/<int:id_juego>', methods=['PUT'])
def actualizar_juego(id_juego):
    juego = Juego.query.get_or_404(id_juego)
    data = request.json
    juego.nombre_juego = data.get('nombre_juego', juego.nombre_juego)
    juego.descripcion = data.get('descripcion', juego.descripcion)
    juego.precio = data.get('precio', juego.precio)
    juego.stock = data.get('stock', juego.stock)
    juego.condicion = data.get('condicion', juego.condicion)
    juego.id_categoria = data.get('id_categoria', juego.id_categoria)
    db.session.commit()
    return jsonify({"mensaje": "Juego actualizado exitosamente"})

@app.route('/juegos/<int:id_juego>', methods=['DELETE'])
def eliminar_juego(id_juego):
    juego = Juego.query.get_or_404(id_juego)
    db.session.delete(juego)
    db.session.commit()
    return jsonify({"mensaje": "Juego eliminado exitosamente"})

### Vistas para la Entidad Factura ###

@app.route('/facturas', methods=['POST'])
def crear_factura():
    data = request.json
    nueva_factura = Factura(
        id_usuario=data['id_usuario'],
        fecha_factura=data['fecha_factura'],
        monto_total=data['monto_total'],
        impuestos=data.get('impuestos', 0),
        total_factura=data['total_factura'],
        metodo_pago=data['metodo_pago'],
        id_divisa=data.get('id_divisa')
    )
    db.session.add(nueva_factura)
    db.session.commit()
    return jsonify({"mensaje": "Factura creada exitosamente", "factura_id": nueva_factura.id_factura}), 201

@app.route('/facturas/<int:id_factura>', methods=['GET'])
def obtener_factura(id_factura):
    factura = Factura.query.get_or_404(id_factura)
    return jsonify({
        "id_factura": factura.id_factura,
        "id_usuario": factura.id_usuario,
        "fecha_factura": factura.fecha_factura.isoformat(),
        "monto_total": str(factura.monto_total),
        "impuestos": str(factura.impuestos),
        "total_factura": str(factura.total_factura),
        "metodo_pago": factura.metodo_pago,
        "id_divisa": factura.id_divisa
    })

@app.route('/facturas/<int:id_factura>', methods=['PUT'])
def actualizar_factura(id_factura):
    factura = Factura.query.get_or_404(id_factura)
    data = request.json
    factura.id_usuario = data.get('id_usuario', factura.id_usuario)
    factura.fecha_factura = data.get('fecha_factura', factura.fecha_factura)
    factura.monto_total = data.get('monto_total', factura.monto_total)
    factura.impuestos = data.get('impuestos', factura.impuestos)
    factura.total_factura = data.get('total_factura', factura.total_factura)
    factura.metodo_pago = data.get('metodo_pago', factura.metodo_pago)
    factura.id_divisa = data.get('id_divisa', factura.id_divisa)
    db.session.commit()
    return jsonify({"mensaje": "Factura actualizada exitosamente"})

@app.route('/facturas/<int:id_factura>', methods=['DELETE'])
def eliminar_factura(id_factura):
    factura = Factura.query.get_or_404(id_factura)
    db.session.delete(factura)
    db.session.commit()
    return jsonify({"mensaje": "Factura eliminada exitosamente"})

if __name__ == '__main__':
    app.run(debug=True)
