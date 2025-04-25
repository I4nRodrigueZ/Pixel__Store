import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;
import 'dart:convert';

class DetalleJuegoScreen extends StatefulWidget {
  final int juegoId;

  const DetalleJuegoScreen({super.key, required this.juegoId});

  @override
  State<DetalleJuegoScreen> createState() => _DetalleJuegoScreenState();
}

class _DetalleJuegoScreenState extends State<DetalleJuegoScreen> {
  late Future<Map<String, dynamic>> juego;

  @override
  void initState() {
    super.initState();
    // Recuperamos el juegoId de los argumentos de la ruta
    final args = ModalRoute.of(context)?.settings.arguments as Map<String, dynamic>;
    final juegoId = args['juegoId'] as int; // Obtenemos el juegoId
    juego = obtenerJuego(juegoId); // Usamos el juegoId para cargar los datos
  }

  Future<Map<String, dynamic>> obtenerJuego(int id) async {
    final response = await http.get(
      Uri.parse('https://tuservidor.com/juego/$id'), // Cambia por tu endpoint real
      headers: {'Content-Type': 'application/json'},
    );

    if (response.statusCode == 200) {
      return jsonDecode(response.body);
    } else {
      throw Exception('Error al obtener juego: ${response.statusCode}');
    }
  }

  double calcularPromedio(List<dynamic> resenas) {
    if (resenas.isEmpty) return 0;
    final sum = resenas.fold<double>(
      0,
      (total, item) => total + (item is int ? item.toDouble() : (item as num).toDouble()),
    );
    return sum / resenas.length;
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text("Detalle del Juego")),
      body: FutureBuilder<Map<String, dynamic>>(
        future: juego,
        builder: (context, snapshot) {
          if (snapshot.connectionState == ConnectionState.waiting) {
            return const Center(child: CircularProgressIndicator());
          } else if (snapshot.hasError) {
            return Center(child: Text("Error: ${snapshot.error}"));
          } else {
            final data = snapshot.data!;
            final double rating = calcularPromedio(data['resenas'] ?? []);
            return Padding(
              padding: const EdgeInsets.all(16.0),
              child: Card(
                elevation: 5,
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
                child: ListView(
                  padding: const EdgeInsets.all(16),
                  children: [
                    if (data['imagen_url'] != null)
                      ClipRRect(
                        borderRadius: BorderRadius.circular(12),
                        child: Image.network(data['imagen_url']),
                      ),
                    const SizedBox(height: 16),
                    Text(
                      data['titulo'] ?? 'Sin título',
                      style: const TextStyle(fontSize: 24, fontWeight: FontWeight.bold),
                    ),
                    const SizedBox(height: 8),
                    Row(
                      children: [
                        const Icon(Icons.star, color: Colors.amber),
                        const SizedBox(width: 4),
                        Text(rating.toStringAsFixed(1)),
                        const SizedBox(width: 8),
                        Text("(${(data['resenas'] ?? []).length} reseñas)"),
                      ],
                    ),
                    const SizedBox(height: 8),
                    Text(data['descripcion'] ?? 'Sin descripción'),
                    const SizedBox(height: 16),
                    Text(
                      "Precio: \$${(data['precio_con_descuento'] ?? 0).toStringAsFixed(2)}",
                      style: const TextStyle(fontSize: 18, color: Colors.green),
                    ),
                    const SizedBox(height: 8),
                    Text("Stock: ${data['stock'] ?? 'No disponible'}"),
                    Text("Condición: ${data['condicion'] ?? 'Desconocida'}"),
                    Text("Categoría: ${data['categoria']?['nombre'] ?? 'No categorizado'}"),
                    const SizedBox(height: 20),
                    ElevatedButton.icon(
                      onPressed: () {
                        // Aquí podrías llamar a una función para agregar al carrito
                        ScaffoldMessenger.of(context).showSnackBar(
                          const SnackBar(content: Text("Agregado al carrito")),
                        );
                      },
                      icon: const Icon(Icons.shopping_cart),
                      label: const Text("Agregar al carrito"),
                      style: ElevatedButton.styleFrom(
                        padding: const EdgeInsets.symmetric(vertical: 14),
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(12),
                        ),
                        backgroundColor: Colors.deepPurple,
                      ),
                    ),
                  ],
                ),
              ),
            );
          }
        },
      ),
    );
  }
}
