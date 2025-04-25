import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;
import 'dart:convert';

class GestionUsuariosPage extends StatefulWidget {
  final String token;
  const GestionUsuariosPage({super.key, required this.token});

  @override
  State<GestionUsuariosPage> createState() => _GestionUsuariosPageState();
}

class _GestionUsuariosPageState extends State<GestionUsuariosPage> {
  List usuarios = [];
  bool isLoading = true;
  Map? usuarioSeleccionado;
  
  // Controladores
  final nombreCtrl = TextEditingController();
  final apellidoCtrl = TextEditingController();
  final emailCtrl = TextEditingController();
  final direccionCtrl = TextEditingController();
  final telefonoCtrl = TextEditingController();
  final contrasenaCtrl = TextEditingController();
  String rolSeleccionado = 'usuario';

  final String baseUrl = 'http://192.168.0.4:5000';

  @override
  void initState() {
    super.initState();
    cargarUsuarios();
  }

  Future<void> cargarUsuarios() async {
    setState(() => isLoading = true);
    try {
      final response = await http.get(
        Uri.parse('$baseUrl/usuarios'),
        headers: {'Authorization': 'Bearer ${widget.token}'},
      );

      if (response.statusCode == 200) {
        setState(() {
          usuarios = json.decode(response.body);
          isLoading = false;
        });
      } else {
        print('Error al cargar usuarios: ${response.body}');
      }
    } catch (e) {
      print('Excepción al cargar usuarios: $e');
    } finally {
      setState(() => isLoading = false);
    }
  }

  void seleccionarUsuario(Map user) {
    setState(() {
      usuarioSeleccionado = user;
      nombreCtrl.text = user['nombre'] ?? '';
      apellidoCtrl.text = user['apellido'] ?? '';
      emailCtrl.text = user['email'] ?? '';
      direccionCtrl.text = user['direccion'] ?? '';
      telefonoCtrl.text = user['telefono']?.toString() ?? '';
      rolSeleccionado = user['rol'] ?? 'usuario';
    });
  }

  Future<void> actualizarUsuario() async {
    if (usuarioSeleccionado == null) return;
    final id = usuarioSeleccionado!['id'];
    try {
      final response = await http.put(
        Uri.parse('$baseUrl/usuario/$id'),
        headers: {
          'Authorization': 'Bearer ${widget.token}',
          'Content-Type': 'application/json',
        },
        body: json.encode({
          'nombre': nombreCtrl.text,
          'apellido': apellidoCtrl.text,
          'email': emailCtrl.text,
          'direccion': direccionCtrl.text,
          'telefono': telefonoCtrl.text,
          'rol': rolSeleccionado,
        }),
      );

      if (response.statusCode == 200) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Usuario actualizado')),
        );
        cargarUsuarios();
        limpiar();
      } else {
        print('Error al actualizar: ${response.body}');
      }
    } catch (e) {
      print('Excepción al actualizar usuario: $e');
    }
  }

  Future<void> eliminarUsuario() async {
    if (usuarioSeleccionado == null) return;
    final id = usuarioSeleccionado!['id'];

    final confirm = await showDialog<bool>(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Eliminar usuario'),
        content: const Text('¿Seguro que deseas eliminar este usuario?'),
        actions: [
          TextButton(onPressed: () => Navigator.pop(context, false), child: const Text('Cancelar')),
          TextButton(onPressed: () => Navigator.pop(context, true), child: const Text('Eliminar')),
        ],
      ),
    );

    if (confirm != true) return;

    try {
      final response = await http.delete(
        Uri.parse('$baseUrl/usuario/$id'),
        headers: {'Authorization': 'Bearer ${widget.token}'},
      );

      if (response.statusCode == 204) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Usuario eliminado')),
        );
        cargarUsuarios();
        limpiar();
      } else {
        print('Error al eliminar: ${response.body}');
      }
    } catch (e) {
      print('Excepción al eliminar usuario: $e');
    }
  }

  Future<void> crearUsuario() async {
    if (nombreCtrl.text.trim().isEmpty || 
        emailCtrl.text.trim().isEmpty || 
        contrasenaCtrl.text.isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Nombre, email y contraseña son obligatorios')),
      );
      return;
    }

    try {
      final response = await http.post(
        Uri.parse('$baseUrl/usuarios'),
        headers: {
          'Authorization': 'Bearer ${widget.token}',
          'Content-Type': 'application/json',
        },
        body: json.encode({
          'nombre': nombreCtrl.text,
          'apellido': apellidoCtrl.text,
          'email': emailCtrl.text,
          'contrasena': contrasenaCtrl.text,
          'direccion': direccionCtrl.text,
          'telefono': telefonoCtrl.text,
          'rol': rolSeleccionado,
          'fecha_registro': DateTime.now().toIso8601String(),
        }),
      );

      if (response.statusCode == 201) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Usuario creado')),
        );
        cargarUsuarios();
        limpiar();
      } else {
        print('Error al crear: ${response.body}');
      }
    } catch (e) {
      print('Excepción al crear usuario: $e');
    }
  }

  void limpiar() {
    setState(() {
      usuarioSeleccionado = null;
      nombreCtrl.clear();
      apellidoCtrl.clear();
      emailCtrl.clear();
      direccionCtrl.clear();
      telefonoCtrl.clear();
      contrasenaCtrl.clear();
      rolSeleccionado = 'usuario';
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.black,
      appBar: AppBar(
        title: const Text('Administrar Usuarios'), 
        backgroundColor: Colors.teal[900]
      ),
      body: isLoading
          ? const Center(child: CircularProgressIndicator())
          : Padding(
              padding: const EdgeInsets.all(16),
              child: Column(
                children: [
                  const Text('Lista de Usuarios', 
                      style: TextStyle(color: Colors.tealAccent, fontSize: 20)),
                  const SizedBox(height: 10),
                  Expanded(
                    child: ListView.builder(
                      itemCount: usuarios.length,
                      itemBuilder: (context, index) {
                        final user = usuarios[index];
                        return Card(
                          color: Colors.teal[800],
                          child: ListTile(
                            title: Text(user['nombre'], style: const TextStyle(color: Colors.white)),
                            subtitle: Text(user['email'], style: const TextStyle(color: Colors.white70)),
                            onTap: () => seleccionarUsuario(user),
                          ),
                        );
                      },
                    ),
                  ),
                  const SizedBox(height: 20),
                  Text(usuarioSeleccionado != null ? 'Editar Usuario' : 'Nuevo Usuario',
                      style: const TextStyle(color: Colors.tealAccent, fontSize: 18)),
                  campoTexto('Nombre', nombreCtrl),
                  campoTexto('Apellido', apellidoCtrl),
                  campoTexto('Email', emailCtrl),
                  if (usuarioSeleccionado == null) 
                    campoTexto('Contraseña', contrasenaCtrl, isPassword: true),
                  campoTexto('Dirección', direccionCtrl),
                  campoTexto('Teléfono', telefonoCtrl, keyboardType: TextInputType.phone),
                  
                  // Selector de Rol
                  DropdownButtonFormField<String>(
                    value: rolSeleccionado,
                    decoration: const InputDecoration(
                      labelText: 'Rol',
                      labelStyle: TextStyle(color: Colors.tealAccent),
                      enabledBorder: OutlineInputBorder(
                        borderSide: BorderSide(color: Colors.teal),
                      ),
                    ),
                    items: ['usuario', 'vendedor']
                        .map((rol) => DropdownMenuItem(
                              value: rol,
                              child: Text(rol, style: const TextStyle(color: Colors.white)),
                            ))
                        .toList(),
                    onChanged: (value) {
                      if (value != null) {
                        setState(() => rolSeleccionado = value);
                      }
                    },
                  ),
                  
                  const SizedBox(height: 10),
                  Row(
                    children: [
                      if (usuarioSeleccionado != null)
                        Expanded(
                          child: ElevatedButton.icon(
                            onPressed: actualizarUsuario,
                            icon: const Icon(Icons.save),
                            label: const Text("Actualizar"),
                            style: ElevatedButton.styleFrom(backgroundColor: Colors.teal),
                          ),
                        ),
                      if (usuarioSeleccionado != null)
                        const SizedBox(width: 8),
                      if (usuarioSeleccionado != null)
                        Expanded(
                          child: ElevatedButton.icon(
                            onPressed: eliminarUsuario,
                            icon: const Icon(Icons.delete),
                            label: const Text("Eliminar"),
                            style: ElevatedButton.styleFrom(backgroundColor: Colors.red),
                          ),
                        ),
                      if (usuarioSeleccionado == null)
                        Expanded(
                          child: ElevatedButton.icon(
                            onPressed: crearUsuario,
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

  Widget campoTexto(String label, TextEditingController controller, 
      {bool isPassword = false, TextInputType keyboardType = TextInputType.text}) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 5),
      child: TextField(
        controller: controller,
        obscureText: isPassword,
        keyboardType: keyboardType,
        style: const TextStyle(color: Colors.white),
        decoration: InputDecoration(
          labelText: label,
          labelStyle: const TextStyle(color: Colors.tealAccent),
          enabledBorder: const OutlineInputBorder(
            borderSide: BorderSide(color: Colors.teal),
          ),
          focusedBorder: const OutlineInputBorder(
            borderSide: BorderSide(color: Colors.cyanAccent),
          ),
        ),
      ),
    );
  }
}