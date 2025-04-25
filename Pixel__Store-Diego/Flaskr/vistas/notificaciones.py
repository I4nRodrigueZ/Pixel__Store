from flask_restful import Resource, reqparse
from flaskr.Modelos import Usuario
from flaskr.utils.email import enviar_correo

class VistaNotificaciones(Resource):
    def post(self):
        parser = reqparse.RequestParser()
        parser.add_argument('asunto', required=True)
        parser.add_argument('mensaje', required=True)
        parser.add_argument('destinatarios', required=True, action='append')  # lista o 'todos'
        datos = parser.parse_args()

        asunto = datos['asunto']
        mensaje = datos['mensaje']
        destinatarios = datos['destinatarios']

        if 'todos' in destinatarios:
            usuarios = Usuario.query.all()
            for user in usuarios:
                enviar_correo(user.email, asunto, mensaje)
        else:
            for email in destinatarios:
                enviar_correo(email, asunto, mensaje)

        return {'mensaje': 'Notificaciones enviadas con éxito 💌'}, 200
