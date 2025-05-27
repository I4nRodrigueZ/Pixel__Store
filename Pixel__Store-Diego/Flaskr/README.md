1. Para SQLite (testing):
   - Cambiar el parámetro en create_app() de 'default' a 'testing':
     def create_app(config_name='testing'):

   - Luego ejecutar los comandos de Flask-Migrate:
     flask db init       (solo primera vez)
     flask db migrate    (crea la migración)
     flask db upgrade    (aplica los cambios)

2. Para MySQL (producción/desarrollo):
   - Asegurarse que el parámetro en create_app() sea 'default':
     def create_app(config_name='default'):

   - Verificar que el servidor MySQL esté corriendo y que la base de datos 'quantumleap' exista

   - Ejecutar los comandos de Flask-Migrate:
     flask db init       (solo primera vez)
     flask db migrate    (crea la migración)
     flask db upgrade    (aplica los cambios)

Notas importantes:
- El archivo test.db (SQLite) se creará automáticamente en el directorio del proyecto
- Para MySQL, asegúrate de tener:
  - El servidor MySQL instalado y corriendo
  - La base de datos 'quantumleap' creada
  - Las credenciales correctas en la URI de conexión