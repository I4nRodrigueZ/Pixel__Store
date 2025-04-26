import 'dart:convert';
import 'package:http/http.dart' as http;

class Juego {
  final int id;
  final String titulo;
  final String descripcion;
  final double precio;
  final int stock;
  final String condicion;
  final int categoriaId;
  final String imagenUrl;
  final double? precioConDescuento;

  Juego({
    required this.id,
    required this.titulo,
    required this.descripcion,
    required this.precio,
    required this.stock,
    required this.condicion,
    required this.categoriaId,
    required this.imagenUrl,
    this.precioConDescuento,
  });

  factory Juego.fromJson(Map<String, dynamic> json) {
    return Juego(
      id: json['id'] is int ? json['id'] : 0,
      titulo: json['titulo'] ?? 'Sin título',
      descripcion: json['descripcion'] ?? 'Descripción no disponible',
      precio: (json['precio'] is num) ? (json['precio'] as num).toDouble() : 0.0,
      stock: json['stock'] is int ? json['stock'] : 0,
      condicion: json['condicion'] ?? 'Nuevo',
      categoriaId: json['categoria_id'] is int ? json['categoria_id'] : 0,
      imagenUrl: json['imagen_url'] ?? '',
      precioConDescuento: json['precio_con_descuento'] != null
          ? (json['precio_con_descuento'] as num).toDouble()
          : null,
    );
  }
}

class ApiService {
  static const String baseUrl = 'http://127.0.0.1:5000';

  // 🔐 Registro de usuario
  static Future<http.Response> registerUser({
    required String nombre,
    required String apellido,
    required String email,
    required String password,
    required String direccion,
    required String telefono,
    required String rol,
  }) async {
    final url = Uri.parse('$baseUrl/usuarios');
    final response = await http.post(
      url,
      headers: {'Content-Type': 'application/json'},
      body: jsonEncode({
        'nombre': nombre,
        'apellido': apellido,
        'email': email,
        'contrasena': password,
        'direccion': direccion,
        'telefono': telefono,
        'rol': rol,
        'fecha_registro': DateTime.now().toIso8601String().split('T')[0],
      }),
    );
    return response;
  }

  // 🔓 Login de usuario
  static Future<http.Response> loginUser({
    required String email,
    required String contrasena,
  }) async {
    final url = Uri.parse('$baseUrl/login');
    final response = await http.post(
      url,
      headers: {'Content-Type': 'application/json'},
      body: jsonEncode({
        'email': email,
        'contrasena': contrasena,
      }),
    );
    return response;
  }

  // 🕹️ Obtener catálogo de juegos
  static Future<List<Juego>> fetchCatalogo() async {
    final url = Uri.parse('$baseUrl/juegos');
    final response = await http.get(url);

    if (response.statusCode == 200) {
      final List<dynamic> data = jsonDecode(response.body);
      return data.map((json) => Juego.fromJson(json)).toList();
    } else {
      throw Exception('Error al cargar el catálogo: ${response.statusCode}');
    }
  }

  // 🔍 Obtener detalles de un juego específico
  static Future<Juego> fetchJuegoDetalles(int idJuego) async {
    final response = await http.get(
      Uri.parse('$baseUrl/juego/$idJuego'),
      headers: {'Content-Type': 'application/json'},
    );

    if (response.statusCode == 200) {
      final jsonData = json.decode(response.body);
      return Juego.fromJson(jsonData);
    } else {
      throw Exception('Error al cargar detalles: ${response.statusCode}');
    }
  }

  // 🛒 Agregar al carrito (ejemplo adicional)
  static Future<http.Response> agregarAlCarrito({
    required int juegoId,
    required int cantidad,
    required String token,
  }) async {
    final url = Uri.parse('$baseUrl/carrito');
    final response = await http.post(
      url,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer $token',
      },
      body: jsonEncode({
        'juego_id': juegoId,
        'cantidad': cantidad,
      }),
    );
    return response;
  }

  // 🔍 Buscar juegos con parámetros de filtrado
  static Future<List<Juego>> buscarJuegos({
    String? query, 
    double? minPrice,
    double? maxPrice,
    int? categoryId,
    bool? inStock,
  }) async {
    final Map<String, String> queryParams = {};
  
    if (query != null && query.isNotEmpty) {
      queryParams['q'] = query;
    }
    if (minPrice != null) {
      queryParams['min_price'] = minPrice.toString();
    }
    if (maxPrice != null) {
      queryParams['max_price'] = maxPrice.toString();
    }
    if (categoryId != null) {
      queryParams['category_id'] = categoryId.toString();
    }
    if (inStock != null && inStock) {
      queryParams['in_stock'] = 'true';
    }

    final url = Uri.parse('$baseUrl/juegos').replace(queryParameters: queryParams);
    final response = await http.get(url);

    if (response.statusCode == 200) {
      final List<dynamic> data = jsonDecode(response.body);
      return data.map((json) => Juego.fromJson(json)).toList();
    } else {
      throw Exception('Error al buscar juegos: ${response.statusCode}');
    }
  }
}
