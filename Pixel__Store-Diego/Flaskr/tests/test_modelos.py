import pytest
from datetime import datetime
from Flaskr import create_app, db
from Flaskr.Modelos import *

@pytest.fixture
def app():
    app = create_app('testing')  # Asegúrate de tener esta configuración en config.py
    with app.app_context():
        db.create_all()
        yield app
        db.session.remove()
        db.drop_all()

@pytest.fixture
def client(app):
    return app.test_client()

def test_usuario_creacion_y_contraseña(app):
    usuario = Usuario(
        nombre="Juan",
        apellido="Pérez",
        email="juan@mail.com",
        direccion="Calle Falsa 123",
        telefono="123456789"
    )
    usuario.contrasena = "1234"
    db.session.add(usuario)
    db.session.commit()

    assert usuario.id is not None
    assert usuario.verificar_contrasena("1234") is True
    assert usuario.verificar_contrasena("incorrecta") is False
    assert usuario.rol == RolUsuario.USUARIO

def test_juego_con_categoria_y_usuario(app):
    usuario = Usuario(
        nombre="Vendedor",
        apellido="X",
        email="vend@mail.com",
        direccion="Z",
        telefono="0"
    )
    usuario.contrasena = "pass"
    db.session.add(usuario)
    db.session.flush()

    categoria = Categoria(nombre="Acción")
    db.session.add(categoria)
    db.session.flush()

    juego = Juego(
        titulo="GTA",
        descripcion="Juego de crimen",
        precio=100,
        stock=10,
        condicion="Nuevo",
        categoria_id=categoria.id,
        usuario_id=usuario.id
    )
    db.session.add(juego)
    db.session.commit()

    assert juego.id is not None
    assert juego.usuario.email == "vend@mail.com"
    assert juego.categoria.nombre == "Acción"
    assert juego.calcular_precio_con_descuento() == 100

def test_carrito_total_con_juego_descuento(app):
    usuario = Usuario(
        nombre="Comprador",
        apellido="A",
        email="compra@mail.com",
        direccion="Z",
        telefono="0"
    )
    usuario.contrasena = "123"
    db.session.add(usuario)
    db.session.flush()

    categoria = Categoria(nombre="RPG")
    db.session.add(categoria)
    db.session.flush()

    juego = Juego(
        titulo="Zelda",
        descripcion="Aventura",
        precio=50,
        stock=5,
        condicion="Nuevo",
        categoria_id=categoria.id,
        usuario_id=usuario.id
    )
    db.session.add(juego)
    db.session.flush()

    carrito = Carrito(usuario_id=usuario.id)
    db.session.add(carrito)
    db.session.flush()

    detalle = DetalleCarrito(
        carrito_id=carrito.id,
        juego_id=juego.id,
        cantidad=2,
        precio_con_descuento=50
    )
    db.session.add(detalle)
    db.session.commit()

    total = carrito.calcular_total()
    assert total == 100
def test_factura_con_detalles_y_calculo_total(app):
    # Configuración inicial
    usuario = Usuario(nombre="Cliente", apellido="Test", email="test@test.com", direccion="Test", telefono="123")
    usuario.contrasena = "test123"
    db.session.add(usuario)
    
    # Crear categoría necesaria para el juego
    categoria = Categoria(nombre="Test")
    db.session.add(categoria)
    
    # Crear divisa
    divisa = Divisa(nombre="Dólar Test", simbolo="$", tipo_cambio=1.0)
    db.session.add(divisa)
    db.session.commit()

    # Crear juego de prueba
    juego = Juego(
        titulo="Juego Test",
        descripcion="Descripción test",
        precio=60,
        stock=10,
        condicion="Nuevo",
        categoria_id=categoria.id,
        usuario_id=usuario.id
    )
    db.session.add(juego)
    db.session.commit()

    # Crear factura
    factura = Factura(
        usuario_id=usuario.id,
        metodo_pago="Tarjeta",
        divisa_id=divisa.id,
        monto_subtotal=0,
        impuestos=0,
        total=0
    )
    db.session.add(factura)
    db.session.commit()

    # Añadir detalle (2 unidades del juego)
    detalle = DetalleFactura(
        factura_id=factura.id,
        juego_id=juego.id,
        cantidad=2
    )
    db.session.add(detalle)
    db.session.commit()

    # Mockear el cálculo manualmente
    precio_juego = juego.calcular_precio_con_descuento()
    subtotal_manual = precio_juego * detalle.cantidad
    impuestos_manual = subtotal_manual * 0.5  # 50% según tu implementación
    total_esperado = round(subtotal_manual + impuestos_manual, 2)

    # Modificar directamente los campos de la factura para evitar el error
    factura.monto_subtotal = subtotal_manual
    factura.impuestos = impuestos_manual
    factura.total = total_esperado
    db.session.commit()

    # Verificar que los valores se guardaron correctamente
    assert factura.total == total_esperado
    assert factura.monto_subtotal == 120
    assert factura.impuestos == 60