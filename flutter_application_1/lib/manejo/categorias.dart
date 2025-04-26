import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;
import 'dart:convert';

class GestionCategoriasPage extends StatefulWidget {
  final String token;
  const GestionCategoriasPage({super.key, required this.token});

  @override
  State<GestionCategoriasPage> createState() => _GestionCategoriasPageState();
}

class _GestionCategoriasPageState extends State<GestionCategoriasPage> {
  List categorias = [];
  bool isLoading = true;
  Map? categoriaSeleccionada;
  final nombreCtrl = TextEditingController();

  final String baseUrl = 'http://127.0.0.1:5000';

  @override
  void initState() {
    super.initState();
    cargarCategorias();
  }

  Future<void> cargarCategorias() async {
    setState(() => isLoading = true);
    try {
      final response = await http.get(
        Uri.parse('$baseUrl/categorias'),
        headers: {'Authorization': 'Bearer ${widget.token}'},
      );

      if (response.statusCode == 200) {
        setState(() {
          categorias = json.decode(response.body);
          isLoading = false;
        });
      } else {
        print('Error al cargar categorías: ${response.body}');
      }
    } catch (e) {
      print('Excepción al cargar categorías: $e');
    }
  }

  void seleccionarCategoria(Map cat) {
    setState(() {
      categoriaSeleccionada = cat;
      nombreCtrl.text = cat['nombre'];
    });
  }

  Future<void> actualizarCategoria() async {
    if (categoriaSeleccionada == null) return;
    final id = categoriaSeleccionada!['id'];
    try {
      final response = await http.put(
        Uri.parse('$baseUrl/categoria/$id'),
        headers: {
          'Authorization': 'Bearer ${widget.token}',
          'Content-Type': 'application/json',
        },
        body: json.encode({'nombre': nombreCtrl.text}),
      );

      if (response.statusCode == 200) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Categoría actualizada')),
        );
        cargarCategorias();
        limpiar();
      } else {
        print('Error al actualizar: ${response.body}');
      }
    } catch (e) {
      print('Excepción al actualizar categoría: $e');
    }
  }

  Future<void> eliminarCategoria() async {
    if (categoriaSeleccionada == null) return;
    final id = categoriaSeleccionada!['id'];

    final confirm = await showDialog<bool>(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Eliminar categoría'),
        content: const Text('¿Seguro que deseas eliminar esta categoría?'),
        actions: [
          TextButton(onPressed: () => Navigator.pop(context, false), child: const Text('Cancelar')),
          TextButton(onPressed: () => Navigator.pop(context, true), child: const Text('Eliminar')),
        ],
      ),
    );

    if (confirm != true) return;

    try {
      final response = await http.delete(
        Uri.parse('$baseUrl/categoria/$id'),
        headers: {'Authorization': 'Bearer ${widget.token}'},
      );

      if (response.statusCode == 200) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Categoría eliminada')),
        );
        cargarCategorias();
        limpiar();
      } else {
        print('Error al eliminar: ${response.body}');
      }
    } catch (e) {
      print('Excepción al eliminar categoría: $e');
    }
  }

  Future<void> crearCategoria() async {
    if (nombreCtrl.text.trim().isEmpty) return;
    try {
      final response = await http.post(
        Uri.parse('$baseUrl/categorias'),
        headers: {
          'Authorization': 'Bearer ${widget.token}',
          'Content-Type': 'application/json',
        },
        body: json.encode({'nombre': nombreCtrl.text}),
      );

      if (response.statusCode == 201) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Categoría creada')),
        );
        cargarCategorias();
        limpiar();
      } else {
        print('Error al crear: ${response.body}');
      }
    } catch (e) {
      print('Excepción al crear categoría: $e');
    }
  }

  void limpiar() {
    setState(() {
      categoriaSeleccionada = null;
      nombreCtrl.clear();
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.black,
      appBar: AppBar(title: const Text('Administrar Categorías'), backgroundColor: Colors.deepPurple),
      body: isLoading
          ? const Center(child: CircularProgressIndicator())
          : Padding(
              padding: const EdgeInsets.all(16),
              child: Column(
                children: [
                  const Text('Lista de Categorías', style: TextStyle(color: Colors.purpleAccent, fontSize: 20)),
                  const SizedBox(height: 10),
                  Expanded(
                    child: ListView.builder(
                      itemCount: categorias.length,
                      itemBuilder: (context, index) {
                        final cat = categorias[index];
                        return Card(
                          color: Colors.deepPurple[700],
                          child: ListTile(
                            title: Text(cat['nombre'], style: const TextStyle(color: Colors.white)),
                            onTap: () => seleccionarCategoria(cat),
                          ),
                        );
                      },
                    ),
                  ),
                  const SizedBox(height: 20),
                  Text(categoriaSeleccionada != null ? 'Editar Categoría' : 'Nueva Categoría',
                      style: const TextStyle(color: Colors.purpleAccent, fontSize: 18)),
                  campoTexto('Nombre', nombreCtrl),
                  const SizedBox(height: 10),
                  Row(
                    children: [
                      if (categoriaSeleccionada != null)
                        Expanded(
                          child: ElevatedButton.icon(
                            onPressed: actualizarCategoria,
                            icon: const Icon(Icons.save),
                            label: const Text("Actualizar"),
                            style: ElevatedButton.styleFrom(backgroundColor: Colors.purple),
                          ),
                        ),
                      if (categoriaSeleccionada != null)
                        const SizedBox(width: 8),
                      if (categoriaSeleccionada != null)
                        Expanded(
                          child: ElevatedButton.icon(
                            onPressed: eliminarCategoria,
                            icon: const Icon(Icons.delete),
                            label: const Text("Eliminar"),
                            style: ElevatedButton.styleFrom(backgroundColor: Colors.red),
                          ),
                        ),
                      if (categoriaSeleccionada == null)
                        Expanded(
                          child: ElevatedButton.icon(
                            onPressed: crearCategoria,
                            icon: const Icon(Icons.add),
                            label: const Text("Crear"),
                            style: ElevatedButton.styleFrom(backgroundColor: Colors.green),
                          ),
                        ),
                      const SizedBox(width: 8),
                      Expanded(
                        child: ElevatedButton.icon(
                          onPressed: limpiar,
                          icon: const Icon(Icons.clear),
                          label: const Text("Cancelar"),
                          style: ElevatedButton.styleFrom(backgroundColor: Colors.grey),
                        ),
                      ),
                    ],
                  )
                ],
              ),
            ),
    );
  }

  Widget campoTexto(String label, TextEditingController controller) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 5),
      child: TextField(
        controller: controller,
        style: const TextStyle(color: Colors.white),
        decoration: InputDecoration(
          labelText: label,
          labelStyle: const TextStyle(color: Colors.purpleAccent),
          enabledBorder: const OutlineInputBorder(
            borderSide: BorderSide(color: Colors.purple),
          ),
          focusedBorder: const OutlineInputBorder(
            borderSide: BorderSide(color: Colors.amber),
          ),
        ),
      ),
    );
  }
}
