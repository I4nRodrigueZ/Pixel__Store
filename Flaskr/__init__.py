from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_restful import Api
from flask_migrate import Migrate
<<<<<<< HEAD
from flask_jwt_extended import JWTManager
from flask_cors import CORS
from .Modelos import db  # Importa db desde el archivo Modelos
from .vistas import (
    VistaUsuarios, VistaUsuario, VistaFacturas, VistaFactura,
    VistaJuegos, VistaJuego, VistaCarritos, VistaCarrito,
    VistaCategorias, VistaCategoria, VistaSignIn, VistalogIn,
    VistaDivisas, VistaDivisa, VistaResenas, VistaResena,
    VistaPromociones, VistaPromocion, VistaLogs, VistaLog
)

def create_app(config_name='default'):
    app = Flask(__name__)

    # Configuración de la base de datos MySQL
    app.config['SQLALCHEMY_DATABASE_URI'] = 'mysql+pymysql://root:@localhost/quantumleap'
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

    # Inicialización de la base de datos y migración
    db.init_app(app)  # Inicializa SQLAlchemy (db es importado desde Modelos)
    migrate = Migrate(app, db)  # Inicializa Flask-Migrate

    # Configuración de JWT
    app.config['JWT_SECRET_KEY'] = 'supersecretkey'  # Cambiar por una clave más segura
    jwt = JWTManager(app)  # Inicializa JWT para autenticar las peticiones

    # Habilita CORS para permitir solicitudes de otros dominios
    CORS(app)

    # Inicialización de la API RESTful
    api = Api(app)

    # Rutas para Usuarios
    api.add_resource(VistaUsuarios, '/usuarios')
    api.add_resource(VistaUsuario, '/usuario/<int:id_usuario>')

    # Rutas para Facturas
    api.add_resource(VistaFacturas, '/facturas')
    api.add_resource(VistaFactura, '/factura/<int:id_factura>')

    # Rutas para Juegos
    api.add_resource(VistaJuegos, '/juegos')
    api.add_resource(VistaJuego, '/juego/<int:id_juego>')

    # Rutas para Carritos
    api.add_resource(VistaCarritos, '/carritos')
    api.add_resource(VistaCarrito, '/carrito/<int:id_carrito>')

    # Rutas para Categorías
    api.add_resource(VistaCategorias, '/categorias')
    api.add_resource(VistaCategoria, '/categorias/<int:id_categoria>')

    # Rutas de login y sign-in
    api.add_resource(VistaSignIn, '/signin')  # Registro de usuario
    api.add_resource(VistalogIn, '/login')    # Ingreso de usuario

    # Rutas para Divisas
    api.add_resource(VistaDivisas, '/divisas')
    api.add_resource(VistaDivisa, '/divisa/<int:id_divisa>')

    # Rutas para Reseñas
    api.add_resource(VistaResenas, '/resenas')
    api.add_resource(VistaResena, '/resena/<int:id_resena>')

    # Rutas para Promociones
    api.add_resource(VistaPromociones, '/promociones')
    api.add_resource(VistaPromocion, '/promocion/<int:id_promocion>')

    # Rutas para Logs
    api.add_resource(VistaLogs, '/logs')
    api.add_resource(VistaLog, '/log/<int:id_log>')
=======
from .Modelos.modelos import db
from .vistas import VistaUsuarios, VistaFacturas, VistaJuegos, VistaCarritos

def create_app(config_name='default'):
    app = Flask(__name__)
    
    # Configuración de la base de datos MySQL
    app.config['SQLALCHEMY_DATABASE_URI'] = 'mysql+pymysql://root:@localhost/quantumleap'
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

    # Inicialización de la base de datos y migración
    db.init_app(app)
    migrate = Migrate(app, db)  # Esto inicializa Flask-Migrate correctamente

    # Configuración de la API RESTful
    api = Api(app)
    api.add_resource(VistaUsuarios, '/usuarios')
    api.add_resource(VistaFacturas, '/facturas')
    api.add_resource(VistaJuegos, '/juegos')
    api.add_resource(VistaCarritos, '/carritos')
 
>>>>>>> 8e54b907b59f43e6b1d54a92cfc4672d687cb283

    return app
