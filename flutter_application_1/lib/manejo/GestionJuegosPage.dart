import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;
import 'package:image_picker/image_picker.dart';

class GestionJuegosPage extends StatefulWidget {
  final String token;
  const GestionJuegosPage({super.key, required this.token});

  @override
  State<GestionJuegosPage> createState() => _GestionJuegosPageState();
}

class _GestionJuegosPageState extends State<GestionJuegosPage> {
  List<dynamic> juegos = [];
  List<dynamic> categorias = [];
  bool isLoading = true;
  Map<String, dynamic>? juegoSeleccionado;

  final tituloCtrl = TextEditingController();
  final descripcionCtrl = TextEditingController();
  final precioCtrl = TextEditingController();
  final stockCtrl = TextEditingController();
  final imagenUrlCtrl = TextEditingController();

  final String baseUrl = 'http://127.0.0.1:5000';
  final String cloudName = 'dtdxmx8ly';
  final String uploadPreset = 'ml_default';

  final List<String> condiciones = ['Nuevo', 'Usado'];
  String condicionSeleccionada = 'Nuevo';
  String? categoriaSeleccionada;
  int? categoriaSeleccionadaId;

  @override
  void initState() {
    super.initState();
    if (widget.token.isNotEmpty) {
      cargarDatosIniciales();
    } else {
      WidgetsBinding.instance.addPostFrameCallback((_) {
        mostrarError('Token inválido o no recibido');
      });
    }
  }

  Future<void> cargarDatosIniciales() async {
    try {
      await Future.wait([cargarJuegos(), cargarCategorias()]);
    } catch (e) {
      mostrarError('Error al cargar datos iniciales: $e');
    } finally {
      if (mounted) setState(() => isLoading = false);
    }
  }

  Future<void> cargarJuegos() async {
    try {
      final response = await http.get(
        Uri.parse('$baseUrl/juegos'),
        headers: {'Authorization': 'Bearer ${widget.token}'},
      );

      if (!mounted) return;

      if (response.statusCode == 200) {
        setState(() => juegos = json.decode(response.body));
      } else {
        mostrarError('Error al cargar juegos: ${response.statusCode}');
      }
    } catch (e) {
      if (mounted) mostrarError('Error al cargar juegos: $e');
    }
  }

  Future<void> cargarCategorias() async {
    try {
      final response = await http.get(
        Uri.parse('$baseUrl/categorias'),
        headers: {'Authorization': 'Bearer ${widget.token}'},
      );

      if (!mounted) return;

      if (response.statusCode == 200) {
        setState(() {
          categorias = json.decode(response.body);
          if (categorias.isNotEmpty) {
            categoriaSeleccionada = categorias[0]['nombre'];
            categoriaSeleccionadaId = categorias[0]['id'];
          }
        });
      } else {
        mostrarError('Error al cargar categorías: ${response.statusCode}');
      }
    } catch (e) {
      if (mounted) mostrarError('Error al cargar categorías: $e');
    }
  }

  void seleccionarJuego(Map<String, dynamic> juego) {
    if (!mounted) return;

    setState(() {
      juegoSeleccionado = juego;
      tituloCtrl.text = juego['titulo']?.toString() ?? '';
      descripcionCtrl.text = juego['descripcion']?.toString() ?? '';
      precioCtrl.text = juego['precio']?.toString() ?? '0';
      stockCtrl.text = juego['stock']?.toString() ?? '0';
      condicionSeleccionada = condiciones.contains(juego['condicion']?.toString())
          ? juego['condicion']!.toString()
          : 'Nuevo';

      final categoriaId = juego['categoria_id'];
      if (categoriaId != null) {
        try {
          final categoria = categorias.firstWhere(
            (cat) => cat['id'] == categoriaId,
          );
          categoriaSeleccionada = categoria['nombre']?.toString();
          categoriaSeleccionadaId = categoria['id'];
        } catch (e) {
          if (categorias.isNotEmpty) {
            categoriaSeleccionada = categorias[0]['nombre']?.toString();
            categoriaSeleccionadaId = categorias[0]['id'];
          }
        }
      }

      imagenUrlCtrl.text = juego['imagen_url']?.toString() ?? '';
    });
  }

  Future<void> agregarJuego() async {
    if (categoriaSeleccionadaId == null) {
      mostrarError('Seleccione una categoría');
      return;
    }

    try {
      final response = await http.post(
        Uri.parse('$baseUrl/juego'),
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ${widget.token}',
        },
        body: json.encode({
          'titulo': tituloCtrl.text,
          'descripcion': descripcionCtrl.text,
          'precio': double.tryParse(precioCtrl.text) ?? 0.0,
          'stock': int.tryParse(stockCtrl.text) ?? 0,
          'condicion': condicionSeleccionada,
          'id_categoria': categoriaSeleccionadaId,
          'imagen_url': imagenUrlCtrl.text,
        }),
      );

      if (!mounted) return;

      if (response.statusCode == 201) {
        mostrarExito('Juego agregado con éxito');
        await cargarJuegos();
        limpiarCampos();
      } else {
        mostrarError('Error al agregar juego: ${response.body}');
      }
    } catch (e) {
      if (mounted) mostrarError('Error al agregar juego: $e');
    }
  }

  Future<void> actualizarJuego() async {
    if (juegoSeleccionado == null) return;
    if (categoriaSeleccionadaId == null) {
      mostrarError('Seleccione una categoría');
      return;
    }

    final id = juegoSeleccionado!['id'];
    try {
      final response = await http.put(
        Uri.parse('$baseUrl/juego/$id'),
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ${widget.token}'
        },
        body: json.encode({
          'titulo': tituloCtrl.text,
          'descripcion': descripcionCtrl.text,
          'precio': double.tryParse(precioCtrl.text) ?? 0.0,
          'stock': int.tryParse(stockCtrl.text) ?? 0,
          'condicion': condicionSeleccionada,
          'id_categoria': categoriaSeleccionadaId,
          'imagen_url': imagenUrlCtrl.text,
        }),
      );

      if (!mounted) return;

      if (response.statusCode == 200) {
        mostrarExito('Juego actualizado con éxito');
        await cargarJuegos();
        limpiarCampos();
      } else {
        mostrarError('Error al actualizar juego: ${response.body}');
      }
    } catch (e) {
      if (mounted) mostrarError('Error al actualizar juego: $e');
    }
  }

  Future<void> eliminarJuego() async {
    if (juegoSeleccionado == null || !mounted) return;

    final confirm = await showDialog<bool>(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text("Confirmar eliminación"),
        content: const Text("¿Estás seguro de eliminar este juego?"),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context, false),
            child: const Text("Cancelar", style: TextStyle(color: Colors.teal)),
          ),
          TextButton(
            onPressed: () => Navigator.pop(context, true),
            child: const Text("Eliminar", style: TextStyle(color: Colors.red)),
          ),
        ],
      ),
    );

    if (confirm != true) return;

    try {
      final id = juegoSeleccionado!['id'];
      final response = await http.delete(
        Uri.parse('$baseUrl/juego/$id'),
        headers: {'Authorization': 'Bearer ${widget.token}'},
      );

      if (!mounted) return;

      if (response.statusCode == 200 || response.statusCode == 204) {
        mostrarExito('Juego eliminado con éxito');
        await cargarJuegos();
        limpiarCampos();
      } else {
        mostrarError('Error al eliminar juego: ${response.body}');
      }
    } catch (e) {
      if (mounted) mostrarError('Error al eliminar juego: $e');
    }
  }

  void limpiarCampos() {
    if (!mounted) return;
    
    setState(() {
      juegoSeleccionado = null;
      tituloCtrl.clear();
      descripcionCtrl.clear();
      precioCtrl.clear();
      stockCtrl.clear();
      condicionSeleccionada = 'Nuevo';
      imagenUrlCtrl.clear();
      
      if (categorias.isNotEmpty) {
        categoriaSeleccionada = categorias[0]['nombre']?.toString();
        categoriaSeleccionadaId = categorias[0]['id'];
      } else {
        categoriaSeleccionada = null;
        categoriaSeleccionadaId = null;
      }
    });
  }

  Future<void> subirImagen() async {
    final picker = ImagePicker();
    final imagen = await picker.pickImage(source: ImageSource.gallery);
    if (imagen == null || !mounted) return;

    showDialog(
      context: context,
      barrierDismissible: false,
      builder: (context) => const Center(child: CircularProgressIndicator()),
    );

    try {
      final request = http.MultipartRequest(
        'POST',
        Uri.parse('https://api.cloudinary.com/v1_1/$cloudName/image/upload'),
      );
      request.fields['upload_preset'] = uploadPreset;
      request.files.add(await http.MultipartFile.fromPath('file', imagen.path));

      final response = await request.send();
      final res = await http.Response.fromStream(response);
      
      if (!mounted) return;
      Navigator.of(context).pop();

      if (res.statusCode == 200) {
        final data = json.decode(res.body);
        setState(() => imagenUrlCtrl.text = data['secure_url']?.toString() ?? '');
        mostrarExito('Imagen subida correctamente');
      } else {
        mostrarError('Error al subir la imagen');
      }
    } catch (e) {
      if (mounted) {
        Navigator.of(context).pop();
        mostrarError('Error al subir imagen: $e');
      }
    }
  }

  void mostrarError(String mensaje) {
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text(mensaje),
        backgroundColor: Colors.red[800],
        duration: const Duration(seconds: 3),
      ),
    );
  }

  void mostrarExito(String mensaje) {
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text(mensaje),
        backgroundColor: Colors.green[800],
        duration: const Duration(seconds: 2),
      ),
    );
  }

  Widget campoTexto(String label, TextEditingController controller, {bool readOnly = false}) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 8),
      child: TextField(
        controller: controller,
        readOnly: readOnly,
        style: const TextStyle(color: Colors.white),
        decoration: InputDecoration(
          labelText: label,
          labelStyle: const TextStyle(color: Colors.purpleAccent),
          enabledBorder: const OutlineInputBorder(
            borderSide: BorderSide(color: Colors.deepPurple),
          ),
          focusedBorder: const OutlineInputBorder(
            borderSide: BorderSide(color: Colors.cyanAccent),
          ),
          filled: true,
          fillColor: Colors.deepPurple[900],
        ),
      ),
    );
  }

  Widget dropdownCondicion() {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 8),
      child: DropdownButtonFormField<String>(
        value: condicionSeleccionada,
        decoration: InputDecoration(
          labelText: 'Condición',
          labelStyle: const TextStyle(color: Colors.purpleAccent),
          enabledBorder: const OutlineInputBorder(
            borderSide: BorderSide(color: Colors.deepPurple),
          ),
          focusedBorder: const OutlineInputBorder(
            borderSide: BorderSide(color: Colors.cyanAccent),
          ),
          filled: true,
          fillColor: Colors.deepPurple[900],
        ),
        dropdownColor: Colors.deepPurple[800],
        style: const TextStyle(color: Colors.white),
        items: condiciones.map((String value) {
          return DropdownMenuItem<String>(
            value: value,
            child: Text(value),
          );
        }).toList(),
        onChanged: (String? newValue) {
          if (newValue != null && mounted) {
            setState(() => condicionSeleccionada = newValue);
          }
        },
      ),
    );
  }

  Widget dropdownCategorias() {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 8),
      child: DropdownButtonFormField<String>(
        value: categoriaSeleccionada,
        decoration: InputDecoration(
          labelText: 'Categoría',
          labelStyle: const TextStyle(color: Colors.purpleAccent),
          enabledBorder: const OutlineInputBorder(
            borderSide: BorderSide(color: Colors.deepPurple),
          ),
          focusedBorder: const OutlineInputBorder(
            borderSide: BorderSide(color: Colors.cyanAccent),
          ),
          filled: true,
          fillColor: Colors.deepPurple[900],
        ),
        dropdownColor: Colors.deepPurple[800],
        style: const TextStyle(color: Colors.white),
        items: categorias.map<DropdownMenuItem<String>>((dynamic categoria) {
          return DropdownMenuItem<String>(
            value: categoria['nombre']?.toString(),
            child: Text(categoria['nombre']?.toString() ?? 'Sin nombre'),
            onTap: () {
              if (mounted) {
                setState(() => categoriaSeleccionadaId = categoria['id']);
              }
            },
          );
        }).toList(),
        onChanged: (String? newValue) {
          if (newValue != null && mounted) {
            setState(() => categoriaSeleccionada = newValue);
          }
        },
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.black,
      appBar: AppBar(
        title: const Text('Administrar Juegos'),
        backgroundColor: Colors.deepPurple[900],
        centerTitle: true,
      ),
      body: isLoading
          ? const Center(child: CircularProgressIndicator())
          : Padding(
              padding: const EdgeInsets.all(16.0),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.stretch,
                children: [
                  const Text(
                    'Lista de Juegos', 
                    style: TextStyle(
                      color: Colors.purpleAccent, 
                      fontSize: 20,
                      fontWeight: FontWeight.bold
                    ),
                    textAlign: TextAlign.center,
                  ),
                  const SizedBox(height: 12),
                  Expanded(
                    flex: 5,
                    child: ListView.builder(
                      itemCount: juegos.length,
                      itemBuilder: (context, index) {
                        final j = juegos[index];
                        return Card(
                          color: Colors.deepPurple[800],
                          margin: const EdgeInsets.symmetric(vertical: 4),
                          child: ListTile(
                            leading: j['imagen_url'] != null
                                ? Image.network(
                                    j['imagen_url']?.toString() ?? '', 
                                    width: 40, 
                                    height: 40, 
                                    errorBuilder: (_, __, ___) => const Icon(Icons.image, color: Colors.white),
                                  )
                                : const Icon(Icons.videogame_asset, color: Colors.white),
                            title: Text(
                              j['titulo']?.toString() ?? 'Sin título', 
                              style: const TextStyle(color: Colors.white),
                            ),
                            subtitle: Text(
                              '\$${j['precio']?.toString() ?? '0'} - Stock: ${j['stock']?.toString() ?? '0'}', 
                              style: const TextStyle(color: Colors.white70),
                            ),
                            onTap: () => seleccionarJuego(Map<String, dynamic>.from(j)),
                          ),
                        );
                      },
                    ),
                  ),
                  const SizedBox(height: 12),
                  const Text(
                    'Formulario de Juego', 
                    style: TextStyle(
                      color: Colors.purpleAccent, 
                      fontSize: 20,
                      fontWeight: FontWeight.bold
                    ),
                    textAlign: TextAlign.center,
                  ),
                  Expanded(
                    flex: 6,
                    child: SingleChildScrollView(
                      child: Column(
                        children: [
                          campoTexto('Título', tituloCtrl),
                          campoTexto('Descripción', descripcionCtrl),
                          campoTexto('Precio', precioCtrl),
                          campoTexto('Stock', stockCtrl),
                          dropdownCondicion(),
                          dropdownCategorias(),
                          campoTexto('URL Imagen', imagenUrlCtrl, readOnly: true),
                          const SizedBox(height: 12),
                          ElevatedButton.icon(
                            onPressed: subirImagen,
                            icon: const Icon(Icons.image),
                            label: const Text("Subir imagen desde galería"),
                            style: ElevatedButton.styleFrom(
                              backgroundColor: Colors.orange,
                              minimumSize: const Size(double.infinity, 50),
                            ),
                          ),
                          const SizedBox(height: 12),
                          Row(
                            children: [
                              Expanded(
                                child: ElevatedButton.icon(
                                  onPressed: juegoSeleccionado != null ? actualizarJuego : agregarJuego,
                                  icon: Icon(juegoSeleccionado != null ? Icons.save : Icons.add),
                                  label: Text(juegoSeleccionado != null ? "Guardar" : "Agregar"),
                                  style: ElevatedButton.styleFrom(
                                    backgroundColor: Colors.green,
                                    minimumSize: const Size(0, 50),
                                  ),
                                ),
                              ),
                              const SizedBox(width: 8),
                              if (juegoSeleccionado != null)
                                Expanded(
                                  child: ElevatedButton.icon(
                                    onPressed: eliminarJuego,
                                    icon: const Icon(Icons.delete),
                                    label: const Text("Eliminar"),
                                    style: ElevatedButton.styleFrom(
                                      backgroundColor: Colors.redAccent,
                                      minimumSize: const Size(0, 50),
                                    ),
                                  ),
                                ),
                              const SizedBox(width: 8),
                              Expanded(
                                child: ElevatedButton.icon(
                                  onPressed: limpiarCampos,
                                  icon: const Icon(Icons.clear),
                                  label: const Text("Cancelar"),
                                  style: ElevatedButton.styleFrom(
                                    backgroundColor: Colors.grey,
                                    minimumSize: const Size(0, 50),
                                  ),
                                ),
                              ),
                            ],
                          ),
                        ],
                      ),
                    ),
                  ),
                ],
              ),
            ),
    );
  }

  @override
  void dispose() {
    tituloCtrl.dispose();
    descripcionCtrl.dispose();
    precioCtrl.dispose();
    stockCtrl.dispose();
    imagenUrlCtrl.dispose();
    super.dispose();
  }
}
