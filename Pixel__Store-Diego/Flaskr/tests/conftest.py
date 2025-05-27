import pytest
from flask import Flask
from Flaskr import create_app  # Asegúrate de tener esta función en __init__.py
from Flaskr.Modelos import db as _db  # Importa tu SQLAlchemy ya inicializado
import os
import tempfile

@pytest.fixture(scope='session')
def app():
    """Crea y configura una app de Flask para los tests"""
    db_fd, db_path = tempfile.mkstemp()

    app = create_app({
        'TESTING': True,
        'SQLALCHEMY_DATABASE_URI': f'sqlite:///{db_path}',
        'SQLALCHEMY_TRACK_MODIFICATIONS': False,
        'WTF_CSRF_ENABLED': False
    })

    with app.app_context():
        _db.create_all()
        yield app

    os.close(db_fd)
    os.unlink(db_path)

@pytest.fixture(scope='session')
def client(app):
    """Un cliente de prueba para la app."""
    return app.test_client()

@pytest.fixture(scope='session')
def runner(app):
    """Un runner para los comandos de la app."""
    return app.test_cli_runner()

@pytest.fixture(scope='function')
def db(app):
    """Crea una nueva base de datos vacía para cada prueba."""
    with app.app_context():
        _db.drop_all()
        _db.create_all()
        yield _db
        _db.session.remove()
        _db.drop_all()
