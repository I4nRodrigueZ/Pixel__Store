from marshmallow import fields
from flask_sqlalchemy import SQLAlchemy
import enum

db = SQLAlchemy()

# Tabla de asociación entre álbumes y canciones
albumes_canciones = db.Table('album_cancion',
    db.Column('album_id', db.Integer, db.ForeignKey('album.id'), primary_key=True),
    db.Column('cancion_id', db.Integer, db.ForeignKey('cancion.id'), primary_key=True)   

)

# Modelo de una canción
class Cancion(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    titulo = db.Column(db.String(128))
    minutos = db.Column(db.Integer)
    segundos = db.Column(db.Integer)
    interprete = db.Column(db.String(128))   

    albumes = db.relationship('Album', secondary=albumes_canciones, back_populates="canciones")   


# Enumeración para el medio de la canción
class Medio(enum.Enum):
    DISCO = 1
    CASETE = 2
    CD = 3

class Album(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    titulo = db.Column(db.String(128))
    anio = db.Column(db.Integer)
    descripcion = db.Column(db.String(512))
    medio = db.Column(db.Enum(Medio), nullable=False)
    usuario = db.Column(db.Integer, db.ForeignKey('usuario.id'))
    canciones = db.relationship('Cancion', secondary='album_cancion', back_populates='albumes')
    c __table_args__ = (db.UniqueConstraint('usuario', 'titulo', name='titulo_unico_album'),)

class Usuario(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    nombre = db.Column(db.String(50))
    contrasena = db.Column(db.String(50))
    albumes = db.relationship('Album', cascade='all, delete, delete-orphan')

    