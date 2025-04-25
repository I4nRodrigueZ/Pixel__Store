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
  final List<Resena>? resenas;

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
    this.resenas,
  });

  factory Juego.fromJson(Map<String, dynamic> json) {
    return Juego(
      id: json['id'],
      titulo: json['titulo'],
      descripcion: json['descripcion'] ?? '',
      precio: json['precio'].toDouble(),
      stock: json['stock'],
      condicion: json['condicion'],
      categoriaId: json['categoria_id'],
      imagenUrl: json['imagen_url'] ?? '',
      precioConDescuento: json['precio_con_descuento']?.toDouble(),
      resenas: json['resenas'] != null 
          ? List<Resena>.from(json['resenas'].map((x) => Resena.fromJson(x)))
          : null,
    );
  }
}

class Resena {
  final int id;
  final String autor;
  final String comentario;
  final int calificacion;
  final DateTime fecha;

  Resena({
    required this.id,
    required this.autor,
    required this.comentario,
    required this.calificacion,
    required this.fecha,
  });

  factory Resena.fromJson(Map<String, dynamic> json) {
    return Resena(
      id: json['id'],
      autor: json['autor'],
      comentario: json['comentario'],
      calificacion: json['calificacion'],
      fecha: DateTime.parse(json['fecha']),
    );
  }
}