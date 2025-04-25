import 'dart:async';
import 'package:flutter/material.dart';
import 'package:animate_do/animate_do.dart';
import 'package:carousel_slider/carousel_slider.dart';
import 'package:google_fonts/google_fonts.dart';
import 'api_service.dart';

class WelcomePage extends StatefulWidget {
  const WelcomePage({super.key});

  @override
  State<WelcomePage> createState() => _WelcomePageState();
}

class _WelcomePageState extends State<WelcomePage> {
  List<Juego> juegos = [];
  bool _isLoading = true;
  double _pixelSize = 4.0;
  final TextEditingController _searchController = TextEditingController();
  Timer? _searchDebounce;

  @override
  void initState() {
    super.initState();
    cargarJuegos();
    _searchController.addListener(_onSearchChanged);
  }

  @override
  void dispose() {
    _searchController.removeListener(_onSearchChanged);
    _searchController.dispose();
    _searchDebounce?.cancel();
    super.dispose();
  }

  void _onSearchChanged() {
    if (_searchDebounce?.isActive ?? false) _searchDebounce?.cancel();
    
    _searchDebounce = Timer(const Duration(milliseconds: 500), () {
      if (_searchController.text.isEmpty) {
        cargarJuegos();
      } else {
        _buscarJuegos();
      }
    });
  }

  Future<void> cargarJuegos() async {
    try {
      setState(() => _isLoading = true);
      final lista = await ApiService.fetchCatalogo();
      setState(() {
        juegos = lista;
        _isLoading = false;
      });
    } catch (e) {
      print("Error cargando juegos: $e");
      setState(() => _isLoading = false);
    }
  }

  Future<void> _buscarJuegos() async {
    try {
      setState(() => _isLoading = true);
      final lista = await ApiService.buscarJuegos(
        query: _searchController.text,
      );
      setState(() {
        juegos = lista;
        _isLoading = false;
      });
    } catch (e) {
      print("Error buscando juegos: $e");
      setState(() => _isLoading = false);
    }
  }

  void _showInfoModal(BuildContext context) {
    showDialog(
      context: context,
      builder: (context) => Dialog(
        backgroundColor: Colors.transparent,
        insetPadding: const EdgeInsets.all(20),
        child: Stack(
          children: [
            Positioned.fill(
              child: CustomPaint(
                painter: _PixelBorderPainter(
                  color: Colors.cyanAccent,
                  pixelSize: _pixelSize,
                ),
              ),
            ),
            Container(
              padding: const EdgeInsets.all(20),
              margin: EdgeInsets.all(_pixelSize * 2),
              decoration: BoxDecoration(
                color: const Color(0xFF0A0A2A),
                border: Border.all(color: Colors.cyanAccent, width: 2),
              ),
              child: Column(
                mainAxisSize: MainAxisSize.min,
                children: [
                  ShaderMask(
                    shaderCallback: (bounds) => const LinearGradient(
                      colors: [Colors.cyanAccent, Colors.purpleAccent],
                    ).createShader(bounds),
                    child: Text(
                      'PIXEL STORE',
                      style: GoogleFonts.pressStart2p(
                        fontSize: 16,
                        color: Colors.white,
                      ),
                    ),
                  ),
                  const SizedBox(height: 16),
                  Text(
                    'Tu tienda digital retro\n\nCompra juegos, claves y contenido digital con la magia arcade de los 80s y 90s.',
                    style: GoogleFonts.pressStart2p(
                      fontSize: 10,
                      color: Colors.white70,
                      height: 1.5,
                    ),
                    textAlign: TextAlign.center,
                  ),
                  const SizedBox(height: 20),
                  _PixelButton(
                    text: 'CERRAR',
                    onPressed: () => Navigator.of(context).pop(),
                    pixelSize: _pixelSize,
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  void _showUserMenu(BuildContext context) {
    showModalBottomSheet(
      backgroundColor: Colors.transparent,
      context: context,
      builder: (context) {
        return Container(
          decoration: BoxDecoration(
            color: const Color(0xFF0A0A2A),
            border: Border.all(color: Colors.cyanAccent, width: 2),
            borderRadius: const BorderRadius.vertical(top: Radius.circular(8)),
          ),
          child: Padding(
            padding: const EdgeInsets.symmetric(vertical: 20, horizontal: 30),
            child: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                _PixelButton(
                  text: 'INICIAR SESIÓN',
                  icon: Icons.login,
                  onPressed: () {
                    Navigator.pop(context);
                    Navigator.pushNamed(context, '/login');
                  },
                  pixelSize: _pixelSize,
                ),
                const SizedBox(height: 12),
                _PixelButton(
                  text: 'REGISTRARSE',
                  icon: Icons.app_registration,
                  onPressed: () {
                    Navigator.pop(context);
                    Navigator.pushNamed(context, '/register');
                  },
                  pixelSize: _pixelSize,
                  color: Colors.purpleAccent,
                ),
              ],
            ),
          ),
        );
      },
    );
  }

  void _showGameDetails(int juegoId) async {
    try {
      setState(() => _isLoading = true);
      final juego = await ApiService.fetchJuegoDetalles(juegoId);

      showDialog(
        context: context,
        builder: (context) => Dialog(
          backgroundColor: Colors.transparent,
          insetPadding: const EdgeInsets.all(20),
          child: Stack(
            children: [
              Positioned.fill(
                child: CustomPaint(
                  painter: _PixelBorderPainter(
                    color: Colors.purpleAccent,
                    pixelSize: _pixelSize,
                  ),
                ),
              ),
              Container(
                padding: const EdgeInsets.all(16),
                margin: EdgeInsets.all(_pixelSize * 2),
                decoration: BoxDecoration(
                  color: const Color(0xFF0A0A2A),
                  border: Border.all(color: Colors.purpleAccent, width: 2),
                ),
                child: SingleChildScrollView(
                  child: Column(
                    mainAxisSize: MainAxisSize.min,
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Container(
                        height: 200,
                        decoration: BoxDecoration(
                          image: DecorationImage(
                            image: NetworkImage(juego.imagenUrl),
                            fit: BoxFit.cover,
                          ),
                          borderRadius: BorderRadius.circular(8),
                        ),
                      ),
                      const SizedBox(height: 16),
                      
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          Expanded(
                            child: Text(
                              juego.titulo.toUpperCase(),
                              style: GoogleFonts.pressStart2p(
                                fontSize: 14,
                                color: Colors.cyanAccent,
                              ),
                            ),
                          ),
                          Container(
                            padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                            decoration: BoxDecoration(
                              color: Colors.purpleAccent.withOpacity(0.2),
                              border: Border.all(color: Colors.purpleAccent),
                              borderRadius: BorderRadius.circular(4),
                            ),
                            child: Text(
                              juego.condicion.toUpperCase(),
                              style: GoogleFonts.pressStart2p(
                                fontSize: 8,
                                color: Colors.purpleAccent,
                              ),
                            ),
                          ),
                        ],
                      ),
                      const SizedBox(height: 12),
                      
                      Text(
                        'STOCK: ${juego.stock}',
                        style: GoogleFonts.pressStart2p(
                          fontSize: 10,
                          color: juego.stock > 0 ? Colors.greenAccent : Colors.redAccent,
                        ),
                      ),
                      const SizedBox(height: 12),
                      
                      Text(
                        'DESCRIPCIÓN:',
                        style: GoogleFonts.pressStart2p(
                          fontSize: 10,
                          color: Colors.cyanAccent,
                        ),
                      ),
                      const SizedBox(height: 4),
                      Text(
                        juego.descripcion,
                        style: GoogleFonts.pressStart2p(
                          fontSize: 8,
                          color: Colors.white70,
                          height: 1.5,
                        ),
                      ),
                      const SizedBox(height: 16),
                      
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(
                                'PRECIO:',
                                style: GoogleFonts.pressStart2p(
                                  fontSize: 8,
                                  color: Colors.white70,
                                ),
                              ),
                              Text(
                                '\$${juego.precio.toStringAsFixed(2)}',
                                style: GoogleFonts.pressStart2p(
                                  fontSize: 14,
                                  color: Colors.cyanAccent,
                                ),
                              ),
                            ],
                          ),
                          if (juego.precioConDescuento != null)
                            Column(
                              crossAxisAlignment: CrossAxisAlignment.end,
                              children: [
                                Text(
                                  'OFERTA:',
                                  style: GoogleFonts.pressStart2p(
                                    fontSize: 8,
                                    color: Colors.white70,
                                  ),
                                ),
                                Text(
                                  '\$${juego.precioConDescuento!.toStringAsFixed(2)}',
                                  style: GoogleFonts.pressStart2p(
                                    fontSize: 14,
                                    color: Colors.greenAccent,
                                  ),
                                ),
                              ],
                            ),
                        ],
                      ),
                      const SizedBox(height: 20),
                      
                      Row(
                        children: [
                          Expanded(
                            child: _PixelButton(
                              text: 'CERRAR',
                              onPressed: () => Navigator.of(context).pop(),
                              pixelSize: _pixelSize,
                              color: Colors.redAccent,
                            ),
                          ),
                          const SizedBox(width: 12),
                          Expanded(
                            child: _PixelButton(
                              text: 'COMPRAR',
                              onPressed: () {
                                Navigator.of(context).pop();
                              },
                              pixelSize: _pixelSize,
                              color: Colors.greenAccent,
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
    } catch (e) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text('Error al cargar detalles: $e'),
          backgroundColor: Colors.red,
        ),
      );
    } finally {
      setState(() => _isLoading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFF0A0A2A),
      body: SafeArea(
        child: Stack(
          children: [
            Positioned.fill(
              child: CustomPaint(
                painter: _GridBackgroundPainter(),
              ),
            ),
            
            Column(
              children: [
                Padding(
                  padding: const EdgeInsets.symmetric(horizontal: 16.0, vertical: 12),
                  child: Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Bounce(
                        duration: const Duration(seconds: 2),
                        infinite: true,
                        child: const Icon(
                          Icons.videogame_asset,
                          color: Colors.cyanAccent,
                          size: 28,
                        ),
                      ),
                      Row(
                        children: [
                          IconButton(
                            icon: const Icon(Icons.info_outline, color: Colors.cyanAccent),
                            onPressed: () => _showInfoModal(context),
                          ),
                          IconButton(
                            icon: const Icon(Icons.shopping_cart, color: Colors.cyanAccent),
                            onPressed: () {},
                          ),
                          IconButton(
                            icon: const Icon(Icons.person, color: Colors.cyanAccent),
                            onPressed: () => _showUserMenu(context),
                          ),
                        ],
                      )
                    ],
                  ),
                ),
                
                // Barra de búsqueda
                Padding(
                  padding: const EdgeInsets.symmetric(horizontal: 16.0),
                  child: _PixelSearchField(
                    controller: _searchController,
                    pixelSize: _pixelSize,
                  ),
                ),
                
                ShaderMask(
                  shaderCallback: (bounds) => const LinearGradient(
                    colors: [Colors.cyanAccent, Colors.purpleAccent],
                  ).createShader(bounds),
                  child: Text(
                    "PIXEL STORE",
                    style: GoogleFonts.pressStart2p(
                      fontSize: 28,
                      letterSpacing: 2,
                      shadows: [
                        Shadow(
                          color: Colors.black.withOpacity(0.8),
                          blurRadius: 10,
                          offset: const Offset(3, 3),
                        ),
                      ],
                    ),
                  ),
                ),
                
                Text(
                  "EL MERCADO RETRO DIGITAL",
                  style: GoogleFonts.pressStart2p(
                    fontSize: 8,
                    color: Colors.white70,
                    letterSpacing: 1,
                  ),
                ),
                
                const SizedBox(height: 16),
                
                const _PromoCarousel(),
                
                const SizedBox(height: 16),
                
                Expanded(
                  child: _isLoading
                      ? const _LoadingAnimation()
                      : _GameGrid(
                          juegos: juegos,
                          onGameTap: _showGameDetails,
                        ),
                ),
                
                Padding(
                  padding: const EdgeInsets.symmetric(vertical: 8),
                  child: Text(
                    "© QUANTUMLEAP™ 2025",
                    style: GoogleFonts.pressStart2p(
                      fontSize: 8,
                      color: Colors.white30,
                    ),
                  ),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }
}

class _PixelSearchField extends StatelessWidget {
  final TextEditingController controller;
  final double pixelSize;

  const _PixelSearchField({
    required this.controller,
    required this.pixelSize,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      margin: const EdgeInsets.only(bottom: 12),
      decoration: BoxDecoration(
        border: Border.all(color: Colors.cyanAccent, width: 2),
        color: Colors.black.withOpacity(0.5),
      ),
      child: Row(
        children: [
          const Padding(
            padding: EdgeInsets.only(left: 12),
            child: Icon(Icons.search, color: Colors.cyanAccent),
          ),
          Expanded(
            child: TextField(
              controller: controller,
              style: GoogleFonts.pressStart2p(
                fontSize: 10,
                color: Colors.white,
              ),
              decoration: InputDecoration(
                border: InputBorder.none,
                contentPadding: const EdgeInsets.symmetric(horizontal: 12),
                hintText: 'BUSCAR JUEGOS...',
                hintStyle: GoogleFonts.pressStart2p(
                  fontSize: 8,
                  color: Colors.white70,
                ),
              ),
              cursorColor: Colors.cyanAccent,
            ),
          ),
          if (controller.text.isNotEmpty)
            IconButton(
              icon: const Icon(Icons.close, color: Colors.cyanAccent, size: 16),
              onPressed: () {
                controller.clear();
                FocusScope.of(context).unfocus();
              },
            ),
        ],
      ),
    );
  }
}

class _PromoCarousel extends StatelessWidget {
  const _PromoCarousel();

  final List<Map<String, dynamic>> promos = const [
    {
      "text": "🎮 DESCUENTOS RETRO",
      "color": Colors.cyanAccent,
      "bgColor": Color(0x2200BCD4),
    },
    {
      "text": "🔥 JUEGOS DEL MES",
      "color": Colors.orangeAccent,
      "bgColor": Color(0x22FF9800),
    },
    {
      "text": "💾 PACKS EXCLUSIVOS",
      "color": Colors.purpleAccent,
      "bgColor": Color(0x229C27B0),
    },
  ];

  @override
  Widget build(BuildContext context) {
    return FadeInUp(
      duration: const Duration(milliseconds: 800),
      child: CarouselSlider(
        options: CarouselOptions(
          height: 100,
          autoPlay: true,
          enlargeCenterPage: true,
          viewportFraction: 0.8,
          autoPlayInterval: const Duration(seconds: 3),
        ),
        items: promos.map((promo) {
          return Builder(
            builder: (BuildContext context) {
              return Container(
                width: MediaQuery.of(context).size.width,
                margin: const EdgeInsets.symmetric(horizontal: 5.0),
                decoration: BoxDecoration(
                  gradient: LinearGradient(
                    begin: Alignment.topLeft,
                    end: Alignment.bottomRight,
                    colors: [
                      promo["bgColor"],
                      Colors.black.withOpacity(0.7),
                    ],
                  ),
                  borderRadius: BorderRadius.circular(8),
                  border: Border.all(
                    color: promo["color"],
                    width: 2,
                  ),
                  boxShadow: [
                    BoxShadow(
                      color: promo["color"].withOpacity(0.3),
                      blurRadius: 10,
                      spreadRadius: 1,
                    ),
                  ],
                ),
                child: Center(
                  child: Text(
                    promo["text"],
                    style: GoogleFonts.pressStart2p(
                      fontSize: 12,
                      color: promo["color"],
                    ),
                  ),
                ),
              );
            },
          );
        }).toList(),
      ),
    );
  }
}

class _GameGrid extends StatelessWidget {
  final List<Juego> juegos;
  final Function(int) onGameTap;

  const _GameGrid({
    required this.juegos,
    required this.onGameTap,
  });

  @override
  Widget build(BuildContext context) {
    return GridView.builder(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
      gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
        crossAxisCount: 2,
        mainAxisSpacing: 16,
        crossAxisSpacing: 16,
        childAspectRatio: 0.8,
      ),
      itemCount: juegos.length,
      itemBuilder: (context, index) {
        final game = juegos[index];
        return ZoomIn(
          duration: Duration(milliseconds: 400 + (index * 150)),
          child: InkWell(
            onTap: () => onGameTap(game.id),
            child: Container(
              decoration: BoxDecoration(
                borderRadius: BorderRadius.circular(8),
                border: Border.all(
                  color: Colors.cyanAccent.withOpacity(0.5),
                  width: 2,
                ),
                gradient: LinearGradient(
                  begin: Alignment.topCenter,
                  end: Alignment.bottomCenter,
                  colors: [
                    Colors.black.withOpacity(0.3),
                    const Color(0xFF1A1A3A).withOpacity(0.7),
                  ],
                ),
                boxShadow: [
                  BoxShadow(
                    color: Colors.cyanAccent.withOpacity(0.1),
                    blurRadius: 10,
                    spreadRadius: 2,
                  ),
                ],
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.stretch,
                children: [
                  Expanded(
                    child: ClipRRect(
                      borderRadius: const BorderRadius.vertical(top: Radius.circular(6)),
                      child: Stack(
                        children: [
                          Image.network(
                            game.imagenUrl,
                            fit: BoxFit.cover,
                            width: double.infinity,
                            height: double.infinity,
                            errorBuilder: (context, error, stackTrace) {
                              return Container(
                                color: Colors.black,
                                child: const Center(
                                  child: Icon(
                                    Icons.broken_image,
                                    color: Colors.white38,
                                  ),
                                ),
                              );
                            },
                          ),
                          Container(
                            decoration: BoxDecoration(
                              gradient: LinearGradient(
                                begin: Alignment.topCenter,
                                end: Alignment.bottomCenter,
                                colors: [
                                  Colors.black.withOpacity(0.1),
                                  Colors.black.withOpacity(0.1),
                                ],
                                stops: const [0.0, 0.1, 0.1, 0.2, 0.2, 0.3, 0.3, 0.4, 0.4, 0.5, 0.5, 0.6, 0.6, 0.7, 0.7, 0.8, 0.8, 0.9, 0.9, 1.0],
                                tileMode: TileMode.repeated,
                              ),
                            ),
                          ),
                        ],
                      ),
                    ),
                  ),
                  
                  Padding(
                    padding: const EdgeInsets.all(8.0),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          game.titulo.toUpperCase(),
                          style: GoogleFonts.pressStart2p(
                            fontSize: 8,
                            color: Colors.white,
                            height: 1.2,
                          ),
                          maxLines: 2,
                          overflow: TextOverflow.ellipsis,
                        ),
                        const SizedBox(height: 4),
                        Row(
                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                          children: [
                            Text(
                              '\$${game.precio.toStringAsFixed(2)}',
                              style: GoogleFonts.pressStart2p(
                                fontSize: 12,
                                color: Colors.cyanAccent,
                              ),
                            ),
                            Container(
                              padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                              decoration: BoxDecoration(
                                color: Colors.purpleAccent.withOpacity(0.2),
                                border: Border.all(color: Colors.purpleAccent),
                                borderRadius: BorderRadius.circular(4),
                              ),
                              child: Text(
                                'COMPRAR',
                                style: GoogleFonts.pressStart2p(
                                  fontSize: 6,
                                  color: Colors.purpleAccent,
                                ),
                              ),
                            ),
                          ],
                        ),
                      ],
                    ),
                  ),
                ],
              ),
            ),
          ),
        );
      },
    );
  }
}

class _PixelButton extends StatelessWidget {
  final String text;
  final IconData? icon;
  final VoidCallback onPressed;
  final double pixelSize;
  final Color color;

  const _PixelButton({
    required this.text,
    this.icon,
    required this.onPressed,
    required this.pixelSize,
    this.color = Colors.cyanAccent,
  });

  @override
  Widget build(BuildContext context) {
    return Material(
      color: Colors.transparent,
      child: InkWell(
        onTap: onPressed,
        splashColor: color.withOpacity(0.3),
        child: Container(
          padding: const EdgeInsets.symmetric(vertical: 12, horizontal: 16),
          decoration: BoxDecoration(
            border: Border.all(color: color, width: 2),
            color: Colors.black.withOpacity(0.5),
          ),
          child: Row(
            mainAxisSize: MainAxisSize.min,
            children: [
              if (icon != null) ...[
                Icon(icon, color: color, size: 16),
                const SizedBox(width: 8),
              ],
              Text(
                text,
                style: GoogleFonts.pressStart2p(
                  fontSize: 10,
                  color: color,
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

class _LoadingAnimation extends StatelessWidget {
  const _LoadingAnimation();

  @override
  Widget build(BuildContext context) {
    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          const Spacer(),
          Spin(
            duration: const Duration(seconds: 2),
            infinite: true,
            child: Icon(
              Icons.videogame_asset,
              color: Colors.cyanAccent,
              size: 50,
            ),
          ),
          const SizedBox(height: 20),
          Text(
            'CARGANDO JUEGOS...',
            style: GoogleFonts.pressStart2p(
              fontSize: 10,
              color: Colors.cyanAccent,
            ),
          ),
          const Spacer(),
        ],
      ),
    );
  }
}

class _GridBackgroundPainter extends CustomPainter {
  @override
  void paint(Canvas canvas, Size size) {
    final paint = Paint()
      ..color = const Color(0xFF121233)
      ..style = PaintingStyle.fill;
    
    canvas.drawRect(Rect.fromLTWH(0, 0, size.width, size.height), paint);
    
    final gridPaint = Paint()
      ..color = Colors.black.withOpacity(0.3)
      ..strokeWidth = 0.5;
    
    for (double x = 0; x < size.width; x += 20) {
      canvas.drawLine(Offset(x, 0), Offset(x, size.height), gridPaint);
    }
    
    for (double y = 0; y < size.height; y += 20) {
      canvas.drawLine(Offset(0, y), Offset(size.width, y), gridPaint);
    }
  }

  @override
  bool shouldRepaint(covariant CustomPainter oldDelegate) => false;
}

class _PixelBorderPainter extends CustomPainter {
  final Color color;
  final double pixelSize;

  const _PixelBorderPainter({required this.color, required this.pixelSize});

  @override
  void paint(Canvas canvas, Size size) {
    final paint = Paint()
      ..color = color
      ..style = PaintingStyle.fill;
    
    for (double x = 0; x < size.width; x += pixelSize) {
      canvas.drawRect(
        Rect.fromLTWH(x, 0, pixelSize, pixelSize),
        paint,
      );
      canvas.drawRect(
        Rect.fromLTWH(x, size.height - pixelSize, pixelSize, pixelSize),
        paint,
      );
    }
    
    for (double y = 0; y < size.height; y += pixelSize) {
      canvas.drawRect(
        Rect.fromLTWH(0, y, pixelSize, pixelSize),
        paint,
      );
      canvas.drawRect(
        Rect.fromLTWH(size.width - pixelSize, y, pixelSize, pixelSize),
        paint,
      );
    }
  }

  @override
  bool shouldRepaint(covariant CustomPainter oldDelegate) => false;
}