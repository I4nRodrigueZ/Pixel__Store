from decimal import Decimal
import json
from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_restful import Api
from flask_migrate import Migrate
from flask_jwt_extended import JWTManager
from flask_cors import CORS
from datetime import timedelta

from .Modelos import db, Usuario, RolUsuario
from .vistas import (
    VistaUsuarios, VistaUsuario, VistaFacturas, VistaFactura,
    VistaJuegos, VistaJuego, VistaCarritos, VistaCarrito,
    VistaCategorias, VistaCategoria, VistaSignIn, VistalogIn,
    VistaDivisas, VistaDivisa, VistaResenas, VistaResena,
    VistaPromociones, VistaPromocion, VistaLogs, VistaLog,
    VistaForgotPassword, VistaResetPassword,
    VistaNotificarAdmin, VistaNotificarTodos,
    VistaDetalleCarrito, VistaDetalleFactura,
    VistaAgregarAlCarrito, VistaEditarCantidadCarrito,
    VistaEliminarDelCarrito, VistaCarritoUsuarioActual, VistaGenerarFactura, VistaJuegosUsuarioActual
)
from .extensiones import mail
from .utils.email import enviar_correo

class CustomJSONEncoder(json.JSONEncoder):
    def default(self, obj):
        if isinstance(obj, Decimal):
            return float(obj)
        return super().default(obj)

def create_app(config_name='default'):
    app = Flask(__name__)
    app.json_encoder = CustomJSONEncoder

    # Configuración dinámica de la base de datos
    if config_name == 'testing':
        app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///test.db'
        app.config['TESTING'] = True
    else:
        app.config['SQLALCHEMY_DATABASE_URI'] = 'mysql+pymysql://root:@localhost/quantumleap'

    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

    # Configuración JWT
    app.config['JWT_SECRET_KEY'] = 'supersecretkey'
    app.config['JWT_ACCESS_TOKEN_EXPIRES'] = timedelta(hours=3)
    jwt = JWTManager(app)

    # Configuración Mail
    app.config['MAIL_SERVER'] = 'smtp.gmail.com'
    app.config['MAIL_PORT'] = 465
    app.config['MAIL_USE_SSL'] = True
    app.config['MAIL_USERNAME'] = 'dguerragomez4@gmail.com'
    app.config['MAIL_PASSWORD'] = 'tdfldsbzaqrmznxe'
    app.config['MAIL_DEFAULT_SENDER'] = 'dguerragomez4@gmail.com'
    mail.init_app(app)

    CORS(app, supports_credentials=True, resources={
        r"/*": {
            "origins": "*",
            "methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
            "allow_headers": ["Content-Type", "Authorization"]
        }
    })

    db.init_app(app)
    migrate = Migrate(app, db)
    api = Api(app)

    # Endpoints
    api.add_resource(VistaUsuarios, '/usuarios')
    api.add_resource(VistaUsuario, '/usuario/<int:id_usuario>')
    api.add_resource(VistaFacturas, '/facturas')
    api.add_resource(VistaFactura, '/factura/<int:id_factura>')
    api.add_resource(VistaJuegos, '/juegos')
    api.add_resource(VistaJuego, '/juego/<int:id_juego>')
    api.add_resource(VistaCarritos, '/carritos')
    api.add_resource(VistaCarrito, '/carrito/<int:id_carrito>')
    api.add_resource(VistaCategorias, '/categorias')
    api.add_resource(VistaCategoria, '/categoria/<int:id_categoria>')
    api.add_resource(VistaSignIn, '/signin')
    api.add_resource(VistalogIn, '/login')
    api.add_resource(VistaDivisas, '/divisas')
    api.add_resource(VistaDivisa, '/divisa/<int:id_divisa>')
    api.add_resource(VistaResenas, '/resenas')
    api.add_resource(VistaResena, '/resena/<int:id_resena>')
    api.add_resource(VistaPromociones, '/promociones')
    api.add_resource(VistaPromocion, '/promocion/<int:id_promocion>')
    api.add_resource(VistaLogs, '/logs')
    api.add_resource(VistaLog, '/log/<int:id_log>')
    api.add_resource(VistaForgotPassword, '/forgot-password')
    api.add_resource(VistaResetPassword, '/reset-password/<string:token>')
    api.add_resource(VistaNotificarAdmin, '/admin/notificar')
    api.add_resource(VistaNotificarTodos, '/admin/notificar-todos')
    api.add_resource(VistaDetalleCarrito, '/detalle-carrito', '/detalle-carrito/<int:id_detalle>')
    api.add_resource(VistaDetalleFactura, '/detalle-factura', '/detalle-factura/<int:id_detalle>')
    api.add_resource(VistaJuegosUsuarioActual, '/mis-juegos')

    # Vistas de carrito
    api.add_resource(VistaCarritoUsuarioActual, '/mi-carrito')
    api.add_resource(VistaAgregarAlCarrito, '/carrito/agregar')
    api.add_resource(VistaEditarCantidadCarrito, '/carrito/editar')
    api.add_resource(VistaEliminarDelCarrito, '/carrito/eliminar/<int:juego_id>')
    api.add_resource(VistaGenerarFactura, '/generar-factura')

    # Superadmins
    def crear_superadmin():
        superadmin = Usuario.query.filter_by(email='diegoelperron@gmail.com').first()
        if not superadmin:
            superadmin = Usuario(
                nombre='Diego_el_perron',
                apellido='Elperron',
                email='diegoelperron@gmail.com',
                contrasena='superadmin123',
                rol=RolUsuario.ADMIN,
                telefono='1234567890',
                direccion='Dirección del Superadmin'
            )
            db.session.add(superadmin)
            db.session.commit()
            print("Superadmin creado exitosamente.")
        else:
            print("El superadmin ya existe.")

    def crear_superadmin2():
        superadmin = Usuario.query.filter_by(email='davinci21@gmail.com').first()
        if not superadmin:
            superadmin = Usuario(
                nombre='David_21',
                apellido='Gansta_Life',
                email='davinci21@gmail.com',
                contrasena='superadmin002',
                rol=RolUsuario.ADMIN,
                telefono='3008353399',
                direccion='Dirección del Superadmin002'
            )
            db.session.add(superadmin)
            db.session.commit()
            print("Superadmin creado exitosamente.")
        else:
            print("El superadmin ya existe.")

    with app.app_context():
        db.create_all()  # crea tablas si no existen (sirve para SQLite sin migraciones)
        crear_superadmin()
        crear_superadmin2()

    return app
