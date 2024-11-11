from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_restful import Api
from modelos import db, Usuario, Factura, DetalleFactura, Juego, Categoria, Carrito, Divisa, Resena, Promocion, JuegosPromociones, MetodoPago, HistorialPrecio, Log
from vistas import VistaUsuarios, VistaFacturas, VistaJuegos  # Ajusta según tus vistas disponibles

# Crear la aplicación
def create_app(config_name='default'):
    app = Flask(__name__)
    
    # Configuración de conexión a la base de datos MySQL (ajusta con tus datos)
    app.config['SQLALCHEMY_DATABASE_URI'] = 'mysql+pymysql://usuario:contraseña@localhost/QuantumLeap'
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
    
    # Inicialización de la base de datos
    db.init_app(app)
    
    # Crear tablas si no existen
    #with app.app_context():
       # db.create_all()
    
    # Configurar rutas y API REST
    api = Api(app)
    api.add_resource(VistaUsuarios, '/usuarios')  # Agrega tus vistas de recursos RESTful
    api.add_resource(VistaFacturas, '/facturas')
    api.add_resource(VistaJuegos, '/juegos')
    
    return app

# Inicializa la aplicación
app = create_app()

if __name__ == '__main__':
    app.run(debug=True)
