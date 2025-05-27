import pytest
from datetime import datetime, date
from Flaskr import create_app, db
from Flaskr.Modelos import Usuario, Juego, Categoria, Carrito, DetalleCarrito, Factura, Divisa, RolUsuario
from sqlalchemy import event
from sqlalchemy.engine import Engine

# Fixtures
@pytest.fixture
def app():
    app = create_app('testing')
    
    # Configuración especial para SQLite
    app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///:memory:'
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
    
    @event.listens_for(Engine, "connect")
    def set_sqlite_pragma(dbapi_connection, connection_record):
        cursor = dbapi_connection.cursor()
        cursor.execute("PRAGMA foreign_keys=ON")
        cursor.close()

    with app.app_context():
        db.create_all()
        
        # Crear usuario admin inicial si no existe
        if not Usuario.query.filter_by(email="diegoelperron@gmail.com").first():
            admin = Usuario(
                nombre="Diego",
                apellido="Admin",
                email="diegoelperron@gmail.com",
                contrasena="superadmin123",
                rol=RolUsuario.ADMIN,
                direccion="Av Siempre Viva 123",
                telefono="3000000000",
                fecha_registro=date(2025, 5, 25)  # Fecha como objeto date
            )
            db.session.add(admin)
            db.session.commit()
        
        yield app
        
        db.session.remove()
        db.drop_all()

@pytest.fixture
def client(app):
    return app.test_client()

@pytest.fixture
def auth_headers(client, app):
    response = client.post(
        '/login',
        json={'email': 'diegoelperron@gmail.com', 'contrasena': 'superadmin123'}
    )
    assert response.status_code == 200
    token = response.json['token']
    return {'Authorization': f'Bearer {token}'}

# Tests
def test_login(client, app):
    # Crear usuario de prueba con fecha como objeto date
    with app.app_context():
        if not Usuario.query.filter_by(email="test@test.com").first():
            user = Usuario(
                nombre="Test",
                apellido="User",
                email="test@test.com",
                contrasena="test123",
                rol=RolUsuario.USUARIO,
                direccion="Test St 123",
                telefono="1234567890",
                fecha_registro=date(2025, 5, 25)  # Objeto date directamente
            )
            db.session.add(user)
            db.session.commit()

    # Test login
    response = client.post(
        '/login',
        json={'email': 'test@test.com', 'contrasena': 'test123'}
    )
    assert response.status_code == 200

def test_usuarios(client, auth_headers):
    # Solución definitiva: Mockear el proceso de inserción
    with client.application.app_context():
        # Crear usuario directamente para el test
        test_user = Usuario(
            nombre="Test",
            apellido="User",
            email="testuser@test.com",
            contrasena="test123",
            rol=RolUsuario.USUARIO,
            direccion="Test Address",
            telefono="1234567890",
            fecha_registro=date(2025, 5, 25)  # Objeto date
        )
        db.session.add(test_user)
        db.session.commit()

    # Verificar que el usuario existe
    response = client.get('/usuarios', headers=auth_headers)
    assert response.status_code == 200
    assert any(u['email'] == 'testuser@test.com' for u in response.json)

def test_juegos(client, app, auth_headers):
    # Crear categoría
    with app.app_context():
        cat = Categoria(nombre="Acción")
        db.session.add(cat)
        db.session.commit()
        cat_id = cat.id

    # Crear juego
    response = client.post(
        '/juegos',
        headers=auth_headers,
        json={
            'titulo': 'Juego Test',
            'precio': 59.99,
            'condicion': 'Nuevo',
            'id_categoria': cat_id,
            'stock': 5
        }
    )
    assert response.status_code == 201

    # Listar juegos
    response = client.get('/juegos')
    assert response.status_code == 200
    assert len(response.json) > 0

def test_carrito_flow(client, app, auth_headers):
    # Configuración inicial
    with app.app_context():
        # Crear categoría
        cat = Categoria(nombre="RPG")
        db.session.add(cat)
        db.session.commit()
        
        # Crear juego
        juego = Juego(
            titulo="Zelda Test",
            precio=59.99,
            condicion="Nuevo",
            categoria_id=cat.id,
            stock=10,
            usuario_id=1  # ID del admin creado en el fixture
        )
        db.session.add(juego)
        db.session.commit()
        juego_id = juego.id

    # Agregar al carrito
    response = client.post(
        '/carrito/agregar',
        headers=auth_headers,
        json={'juego_id': juego_id, 'cantidad': 1}
    )
    assert response.status_code == 200

    # Verificar carrito
    response = client.get('/mi-carrito', headers=auth_headers)
    assert response.status_code == 200
    assert len(response.json['juegos']) == 1

    # Eliminar del carrito
    response = client.delete(
        f'/carrito/eliminar/{juego_id}',
        headers=auth_headers
    )
    assert response.status_code == 200

def test_facturacion_flow(client, app, auth_headers):
    # Configuración inicial
    with app.app_context():
        # Crear categoría
        cat = Categoria(nombre="Aventura")
        db.session.add(cat)
        db.session.commit()
        
        # Crear juego
        juego = Juego(
            titulo="Mario Test",
            precio=49.99,
            condicion="Nuevo",
            categoria_id=cat.id,
            stock=10,
            usuario_id=1
        )
        db.session.add(juego)
        
        # Crear divisa
        divisa = Divisa(nombre="Dólar", simbolo="$", tipo_cambio=1.0)
        db.session.add(divisa)
        db.session.commit()
        divisa_id = divisa.id
        
        # Asegurar carrito
        usuario = Usuario.query.get(1)
        if not usuario.carrito:
            carrito = Carrito(usuario_id=usuario.id)
            db.session.add(carrito)
            db.session.commit()
        
        # Agregar item al carrito
        detalle = DetalleCarrito(
            carrito_id=usuario.carrito.id,
            juego_id=juego.id,
            cantidad=1,
            precio_con_descuento=49.99
        )
        db.session.add(detalle)
        db.session.commit()

    # Generar factura
    response = client.post(
        '/generar-factura',
        headers=auth_headers,
        json={'metodo_pago': 'Tarjeta', 'divisa_id': divisa_id}
    )
    assert response.status_code == 201
    
    # Verificar factura
    factura_id = response.json['factura_id']
    response = client.get(f'/factura/{factura_id}', headers=auth_headers)
    assert response.status_code == 200
    assert abs(response.json['total'] - (49.99 * 1.19)) < 0.01  # IVA 19%

def test_divisas(client, auth_headers):
    # Crear nueva divisa
    response = client.post(
        '/divisas',
        headers=auth_headers,
        json={
            'nombre': 'Euro Test', 
            'simbolo': '€', 
            'tipo_cambio': 0.85
        }
    )
    assert response.status_code == 201
    
    # Listar divisas
    response = client.get('/divisas', headers=auth_headers)
    assert response.status_code == 200
    assert any(d['nombre'] == 'Euro Test' for d in response.json)