import 'dart:async';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import '../manejo/usuarios.dart'; // Importa la vista de usuarios
import '../manejo/categorias.dart'; // Importa la vista de categorías
import '../manejo/GestionJuegosPage.dart'; // Importa la vista de juegos

class AdminHomePage extends StatefulWidget {
  final String token;

  const AdminHomePage({super.key, required this.token});

  @override
  State<AdminHomePage> createState() => _AdminHomePageState();
}

class _AdminHomePageState extends State<AdminHomePage> {
  late Timer _timer;
  String _horaActual = _obtenerHoraActual();
  double _scanLinePosition = 0.0;

  static String _obtenerHoraActual() {
    final now = DateTime.now();
    return "${_formatoDosDigitos(now.hour)}:${_formatoDosDigitos(now.minute)}:${_formatoDosDigitos(now.second)}";
  }

  static String _formatoDosDigitos(int n) => n.toString().padLeft(2, '0');

  @override
  void initState() {
    super.initState();
    SystemChrome.setPreferredOrientations([
      DeviceOrientation.portraitUp,
    ]);

    _timer = Timer.periodic(const Duration(seconds: 1), (timer) {
      setState(() {
        _horaActual = _obtenerHoraActual();
      });
    });

    Timer.periodic(const Duration(milliseconds: 50), (timer) {
      setState(() {
        _scanLinePosition = (_scanLinePosition + 0.02) % 1.0;
      });
    });
  }

  @override
  void dispose() {
    _timer.cancel();
    SystemChrome.setPreferredOrientations([
      DeviceOrientation.portraitUp,
      DeviceOrientation.landscapeRight,
      DeviceOrientation.landscapeLeft,
    ]);
    super.dispose();
  }

  Widget _buildBotonRetro(String texto, VoidCallback onPressed) {
    return MouseRegion(
      onEnter: (_) => HapticFeedback.lightImpact(),
      child: AnimatedContainer(
        duration: const Duration(milliseconds: 100),
        margin: const EdgeInsets.symmetric(vertical: 12),
        decoration: BoxDecoration(
          color: Colors.black,
          border: Border.all(
            color: Colors.cyanAccent,
            width: 2.5,
          ),
          boxShadow: [
            BoxShadow(
              color: Colors.cyanAccent.withOpacity(0.9),
              blurRadius: 12,
              spreadRadius: 0,
              offset: const Offset(0, 0),
            ),
            BoxShadow(
              color: Colors.cyanAccent.withOpacity(0.4),
              blurRadius: 24,
              spreadRadius: 8,
              offset: const Offset(0, 0),
            ),
          ],
          gradient: LinearGradient(
            begin: Alignment.topLeft,
            end: Alignment.bottomRight,
            colors: [
              Colors.black.withOpacity(0.7),
              Colors.black.withOpacity(0.3),
            ],
          ),
        ),
        child: Stack(
          children: [
            Positioned.fill(
              child: Container(
                decoration: BoxDecoration(
                  gradient: LinearGradient(
                    begin: Alignment.topCenter,
                    end: Alignment.bottomCenter,
                    colors: [
                      Colors.black.withOpacity(0.15),
                      Colors.black.withOpacity(0.4),
                    ],
                    stops: [0.0, 0.03],
                    tileMode: TileMode.repeated,
                  ),
                ),
              ),
            ),
            Positioned(
              top: 0,
              left: 0,
              child: Container(
                width: 20,
                height: 20,
                decoration: BoxDecoration(
                  gradient: RadialGradient(
                    radius: 1.0,
                    colors: [
                      Colors.cyanAccent.withOpacity(0.3),
                      Colors.transparent,
                    ],
                  ),
                ),
              ),
            ),
            TextButton(
              onPressed: () {
                HapticFeedback.mediumImpact();
                onPressed();
              },
              style: TextButton.styleFrom(
                padding: const EdgeInsets.symmetric(vertical: 18, horizontal: 24),
                backgroundColor: Colors.transparent,
              ),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Text(
                    "> ",
                    style: TextStyle(
                      color: Colors.cyanAccent.withOpacity(0.7),
                      fontSize: 14,
                    ),
                  ),
                  Text(
                    texto,
                    style: TextStyle(
                      fontFamily: 'Courier',
                      fontSize: 12,
                      fontWeight: FontWeight.bold,
                      color: Colors.cyanAccent,
                      letterSpacing: 1.2,
                      shadows: [
                        Shadow(
                          color: Colors.cyanAccent.withOpacity(0.8),
                          blurRadius: 15,
                          offset: const Offset(0, 0),
                        ),
                      ],
                    ),
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFF050505),
      body: Stack(
        children: [
          Positioned.fill(
            child: Container(
              decoration: const BoxDecoration(
                image: DecorationImage(
                  image: AssetImage('assets/images/scanlines.png'),
                  fit: BoxFit.cover,
                  opacity: 0.03,
                  colorFilter: ColorFilter.mode(
                    Colors.black87,
                    BlendMode.darken,
                  ),
                ),
              ),
            ),
          ),
          AnimatedPositioned(
            duration: const Duration(milliseconds: 50),
            top: MediaQuery.of(context).size.height * _scanLinePosition,
            child: Container(
              width: MediaQuery.of(context).size.width,
              height: 2,
              decoration: BoxDecoration(
                gradient: LinearGradient(
                  colors: [
                    Colors.cyanAccent.withOpacity(0.05),
                    Colors.cyanAccent.withOpacity(0.3),
                    Colors.cyanAccent.withOpacity(0.05),
                  ],
                  stops: const [0.0, 0.5, 1.0],
                ),
              ),
            ),
          ),
          SingleChildScrollView(
            padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 30),
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                Container(
                  padding: const EdgeInsets.all(16),
                  margin: const EdgeInsets.only(bottom: 30),
                  decoration: BoxDecoration(
                    border: Border(
                      bottom: BorderSide(
                        color: Colors.cyanAccent.withOpacity(0.5),
                        width: 1.5,
                      ),
                    ),
                  ),
                  child: Column(
                    children: [
                      Text(
                        'ARCADE OS',
                        style: TextStyle(
                          fontFamily: 'PressStart2P',
                          fontSize: 22,
                          color: Colors.cyanAccent,
                          letterSpacing: 4,
                          shadows: [
                            Shadow(
                              color: Colors.cyanAccent.withOpacity(0.7),
                              blurRadius: 20,
                              offset: const Offset(0, 0),
                            ),
                          ],
                        ),
                      ),
                      const SizedBox(height: 8),
                      Text(
                        'ADMINISTRATION TERMINAL',
                        style: TextStyle(
                          fontFamily: 'Courier',
                          fontSize: 14,
                          color: Colors.cyanAccent.withOpacity(0.8),
                          letterSpacing: 6,
                        ),
                      ),
                    ],
                  ),
                ),
                Container(
                  padding: const EdgeInsets.symmetric(vertical: 12, horizontal: 24),
                  margin: const EdgeInsets.only(bottom: 40),
                  decoration: BoxDecoration(
                    border: Border.all(
                      color: Colors.cyanAccent.withOpacity(0.7),
                      width: 1,
                    ),
                    color: Colors.black.withOpacity(0.4),
                  ),
                  child: Text(
                    "SYSTEM TIME: $_horaActual",
                    style: const TextStyle(
                      fontFamily: 'Courier',
                      fontSize: 14,
                      fontWeight: FontWeight.bold,
                      color: Colors.cyanAccent,
                      letterSpacing: 2,
                    ),
                  ),
                ),
                _buildBotonRetro("CATEGORY MANAGEMENT", () {
                  Navigator.push(
                    context,
                    MaterialPageRoute(
                      builder: (context) => GestionCategoriasPage(token: widget.token),
                    ),
                  );
                }),
                _buildBotonRetro("GAME DATABASE", () {
                  Navigator.push(
                    context,
                    MaterialPageRoute(
                      builder: (context) => GestionJuegosPage(token: widget.token),
                    ),
                  );
                }),
                _buildBotonRetro("USER CONTROL PANEL", () {
                  Navigator.push(
                    context,
                    MaterialPageRoute(
                      builder: (context) =>
                          GestionUsuariosPage(token: widget.token),
                    ),
                  );
                }),
                Container(
                  margin: const EdgeInsets.only(top: 40),
                  padding: const EdgeInsets.all(12),
                  child: Text(
                    "v3.1.4 © 1987 ARCADE SYSTEMS\nALL RIGHTS RESERVED",
                    style: TextStyle(
                      fontFamily: 'Courier',
                      fontSize: 10,
                      color: Colors.cyanAccent.withOpacity(0.5),
                      letterSpacing: 1.5,
                      height: 1.5,
                    ),
                    textAlign: TextAlign.center,
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}
