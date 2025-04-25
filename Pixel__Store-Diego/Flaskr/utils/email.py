from flask_mail import Message
from ..extensiones import mail
from flask import current_app, render_template
from datetime import datetime

# Función ORIGINAL para notificaciones (NO MODIFICAR)
def enviar_correo(destinatario, asunto, contenido_html):
    """Envía correos usando la plantilla email_notificacion.html"""
    with current_app.app_context():
        mensaje = Message(subject=asunto, recipients=[destinatario])
        mensaje.html = render_template("email_notificacion.html", mensaje=contenido_html)
        mail.send(mensaje)

# Función NUEVA para facturas (con su propia plantilla)
def enviar_facturas_por_correo(destinatario, facturas):
    """Envía facturas usando la plantilla email_factura.html"""
    with current_app.app_context():
        mensaje = Message(
            subject="🧾 Tus facturas de Pixel Store",
            recipients=[destinatario]
        )
        mensaje.html = render_template(
            "email_template.html",  # Plantilla específica para facturas
            facturas=facturas,
            url_tienda="https://tupixelstore.com",
            año_actual=datetime.now().year
        )
        mail.send(mensaje)