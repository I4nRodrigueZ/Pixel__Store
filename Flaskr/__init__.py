from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_restful import Api
from flask_migrate import Migrate
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
 

    return app
