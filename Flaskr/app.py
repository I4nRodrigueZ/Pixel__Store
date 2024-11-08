from flaskr import create_app
from flaskr.modelos.modelos import Album, Usuario, Medio, Cancion
from .modelos import db
#from modelos import db

app = create_app('default')
app_context = app.app_context()
app_context.push()
db.init_app(app)
db.create_all()
