from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_restful import Api
from .modelos import db, Usuario, Factura, Juego, Carrito, Notificacion, HistorialPrecio
from .vistas import VistaUsuarios, VistaFacturas, VistaJuegos, VistaCarritos, VistaNotificaciones, VistaHistorialPrecios

def create_app(config_name='default'):
    app = Flask(__name__)
    
    # Configuración de la base de datos MySQL
    app.config['SQLALCHEMY_DATABASE_URI'] = 'mysql+pymysql://usuario:contraseña@localhost/QuantumLeap'
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
    
    # Inicialización de la base de datos
    db.init_app(app)
    
    # Configuración de la API RESTful
    api = Api(app)
    api.add_resource(VistaUsuarios, '/usuarios')
    api.add_resource(VistaFacturas, '/facturas')
    api.add_resource(VistaJuegos, '/juegos')
    api.add_resource(VistaCarritos, '/carritos')
    api.add_resource(VistaNotificaciones, '/notificaciones')
    api.add_resource(VistaHistorialPrecios, '/historial-precios')

    # Crear las tablas si no existen
    with app.app_context():
        db.create_all()

    return app
