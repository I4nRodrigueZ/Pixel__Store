"""empty message

Revision ID: 5e9f75c9e5c3
Revises: 
Create Date: 2025-04-21 10:09:44.196136

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '5e9f75c9e5c3'
down_revision = None
branch_labels = None
depends_on = None


def upgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    op.create_table('categoria',
    sa.Column('id', sa.Integer(), nullable=False),
    sa.Column('nombre', sa.String(length=100), nullable=False),
    sa.PrimaryKeyConstraint('id'),
    sa.UniqueConstraint('nombre')
    )
    op.create_table('divisas',
    sa.Column('id', sa.Integer(), nullable=False),
    sa.Column('nombre', sa.String(length=50), nullable=False),
    sa.Column('simbolo', sa.String(length=10), nullable=False),
    sa.Column('tipo_cambio', sa.Float(precision=10, asdecimal=4), nullable=False),
    sa.PrimaryKeyConstraint('id')
    )
    op.create_table('promocion',
    sa.Column('id', sa.Integer(), nullable=False),
    sa.Column('nombre', sa.String(length=100), nullable=False),
    sa.Column('tipo_descuento', sa.Enum('Porcentaje', 'Monto_Fijo', name='tipo_descuento_enum'), nullable=False),
    sa.Column('valor_descuento', sa.Float(precision=5, asdecimal=2), nullable=False),
    sa.Column('fecha_inicio', sa.Date(), nullable=False),
    sa.Column('fecha_fin', sa.Date(), nullable=False),
    sa.Column('es_global', sa.Boolean(), nullable=True),
    sa.PrimaryKeyConstraint('id')
    )
    op.create_table('usuario',
    sa.Column('id', sa.Integer(), nullable=False),
    sa.Column('nombre', sa.String(length=50), nullable=False),
    sa.Column('apellido', sa.String(length=50), nullable=False),
    sa.Column('email', sa.String(length=100), nullable=False),
    sa.Column('contrasena_hash', sa.String(length=255), nullable=False),
    sa.Column('rol', sa.Enum('ADMIN', 'USUARIO', 'VENDEDOR', name='rolusuario'), nullable=False),
    sa.Column('fecha_registro', sa.Date(), nullable=False),
    sa.Column('direccion', sa.String(length=150), nullable=True),
    sa.Column('telefono', sa.String(length=20), nullable=True),
    sa.Column('reset_token', sa.String(length=100), nullable=True),
    sa.PrimaryKeyConstraint('id'),
    sa.UniqueConstraint('email')
    )
    op.create_table('carrito',
    sa.Column('id', sa.Integer(), nullable=False),
    sa.Column('usuario_id', sa.Integer(), nullable=False),
    sa.Column('total', sa.Float(), nullable=False),
    sa.ForeignKeyConstraint(['usuario_id'], ['usuario.id'], ),
    sa.PrimaryKeyConstraint('id')
    )
    op.create_table('factura',
    sa.Column('id', sa.Integer(), nullable=False),
    sa.Column('fecha', sa.DateTime(), nullable=False),
    sa.Column('monto_subtotal', sa.Float(), nullable=False),
    sa.Column('impuestos', sa.Float(), nullable=False),
    sa.Column('total', sa.Float(), nullable=False),
    sa.Column('metodo_pago', sa.String(length=50), nullable=False),
    sa.Column('divisa_id', sa.Integer(), nullable=False),
    sa.Column('usuario_id', sa.Integer(), nullable=False),
    sa.ForeignKeyConstraint(['divisa_id'], ['divisas.id'], ),
    sa.ForeignKeyConstraint(['usuario_id'], ['usuario.id'], ),
    sa.PrimaryKeyConstraint('id')
    )
    op.create_table('juego',
    sa.Column('id', sa.Integer(), nullable=False),
    sa.Column('titulo', sa.String(length=100), nullable=False),
    sa.Column('descripcion', sa.String(length=500), nullable=True),
    sa.Column('precio', sa.Float(), nullable=False),
    sa.Column('stock', sa.Integer(), nullable=False),
    sa.Column('condicion', sa.String(length=50), nullable=False),
    sa.Column('categoria_id', sa.Integer(), nullable=False),
    sa.Column('imagen_url', sa.String(length=500), nullable=True),
    sa.ForeignKeyConstraint(['categoria_id'], ['categoria.id'], ),
    sa.PrimaryKeyConstraint('id')
    )
    op.create_table('logs',
    sa.Column('id', sa.Integer(), nullable=False),
    sa.Column('usuario_id', sa.Integer(), nullable=False),
    sa.Column('accion', sa.String(length=200), nullable=False),
    sa.Column('fecha_hora', sa.DateTime(), nullable=False),
    sa.Column('detalles', sa.Text(), nullable=True),
    sa.ForeignKeyConstraint(['usuario_id'], ['usuario.id'], ),
    sa.PrimaryKeyConstraint('id')
    )
    op.create_table('detalle_carrito',
    sa.Column('carrito_id', sa.Integer(), nullable=False),
    sa.Column('juego_id', sa.Integer(), nullable=False),
    sa.Column('cantidad', sa.Integer(), nullable=False),
    sa.Column('precio_con_descuento', sa.Numeric(), nullable=False),
    sa.ForeignKeyConstraint(['carrito_id'], ['carrito.id'], ),
    sa.ForeignKeyConstraint(['juego_id'], ['juego.id'], ),
    sa.PrimaryKeyConstraint('carrito_id', 'juego_id')
    )
    op.create_table('detalle_factura',
    sa.Column('factura_id', sa.Integer(), nullable=False),
    sa.Column('juego_id', sa.Integer(), nullable=False),
    sa.Column('cantidad', sa.Integer(), nullable=False),
    sa.ForeignKeyConstraint(['factura_id'], ['factura.id'], ),
    sa.ForeignKeyConstraint(['juego_id'], ['juego.id'], ),
    sa.PrimaryKeyConstraint('factura_id', 'juego_id')
    )
    op.create_table('juegos_promociones',
    sa.Column('juego_id', sa.Integer(), nullable=False),
    sa.Column('promocion_id', sa.Integer(), nullable=False),
    sa.ForeignKeyConstraint(['juego_id'], ['juego.id'], ),
    sa.ForeignKeyConstraint(['promocion_id'], ['promocion.id'], ),
    sa.PrimaryKeyConstraint('juego_id', 'promocion_id'),
    info={'bind_key': None}
    )
    op.create_table('resena',
    sa.Column('id', sa.Integer(), nullable=False),
    sa.Column('juego_id', sa.Integer(), nullable=False),
    sa.Column('usuario_id', sa.Integer(), nullable=False),
    sa.Column('puntuacion', sa.Integer(), nullable=False),
    sa.Column('comentario', sa.Text(), nullable=False),
    sa.Column('fecha', sa.DateTime(), nullable=False),
    sa.Column('editada', sa.Boolean(), nullable=True),
    sa.Column('fecha_edicion', sa.DateTime(), nullable=True),
    sa.CheckConstraint('puntuacion >= 1 AND puntuacion <= 5', name='check_puntuacion_rango'),
    sa.ForeignKeyConstraint(['juego_id'], ['juego.id'], ondelete='CASCADE'),
    sa.ForeignKeyConstraint(['usuario_id'], ['usuario.id'], ondelete='CASCADE'),
    sa.PrimaryKeyConstraint('id')
    )
    # ### end Alembic commands ###


def downgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    op.drop_table('resena')
    op.drop_table('juegos_promociones')
    op.drop_table('detalle_factura')
    op.drop_table('detalle_carrito')
    op.drop_table('logs')
    op.drop_table('juego')
    op.drop_table('factura')
    op.drop_table('carrito')
    op.drop_table('usuario')
    op.drop_table('promocion')
    op.drop_table('divisas')
    op.drop_table('categoria')
    # ### end Alembic commands ###
