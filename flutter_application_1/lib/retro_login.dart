import 'package:flutter/material.dart';
import 'api_service.dart';
import 'dart:convert';
import 'home_page.dart';
import 'welcome_page.dart';
import 'admin_home_page.dart';
import 'seller_home_page.dart';

class RetroLoginPage extends StatefulWidget {
  const RetroLoginPage({super.key});

  @override
  State<RetroLoginPage> createState() => _RetroLoginPageState();
}

class _RetroLoginPageState extends State<RetroLoginPage> with SingleTickerProviderStateMixin {
  final TextEditingController emailController = TextEditingController();
  final TextEditingController contrasenaController = TextEditingController();
  bool isLoading = false;

  late AnimationController _animController;
  late Animation<double> _scaleAnimation;

  @override
  void initState() {
    super.initState();
    _animController = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 800),
    )..forward();

    _scaleAnimation = CurvedAnimation(
      parent: _animController,
      curve: Curves.easeOutBack,
    );
  }

  @override
  void dispose() {
    _animController.dispose();
    emailController.dispose();
    contrasenaController.dispose();
    super.dispose();
  }

  Future<void> _loginUsuario() async {
    final email = emailController.text.trim();
    final contrasena = contrasenaController.text;

    if (email.isEmpty || contrasena.isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Por favor, completa todos los campos')),
      );
      return;
    }

    setState(() => isLoading = true);

    try {
      final response = await ApiService.loginUser(email: email, contrasena: contrasena);

      setState(() => isLoading = false);

      if (response.statusCode == 200) {
        final responseData = jsonDecode(response.body);
        final token = responseData['token'];
        final rol = responseData['rol'];

        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Login exitoso')),
        );

        debugPrint('Token JWT: $token');
        debugPrint('Rol del usuario: $rol');

        // Redirección basada en el rol
        Widget nextPage;
        if (rol == 'admin') {
          nextPage = AdminHomePage(token: token);
        } else if (rol == 'vendedor') {
          nextPage = const SellerHomePage();
        } else {
          nextPage = const HomePage();
        }

        Navigator.pushReplacement(
          context,
          MaterialPageRoute(builder: (_) => nextPage),
        );
      } else {
        final responseData = jsonDecode(response.body);
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Error: ${responseData["mensaje"] ?? "Credenciales incorrectas"}')),
        );
      }
    } catch (e) {
      setState(() => isLoading = false);
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Error de conexión: $e')),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Stack(
        children: [
          // Fondo retro
          Container(
            decoration: const BoxDecoration(
              gradient: RadialGradient(
                center: Alignment(0, -0.4),
                radius: 1.2,
                colors: [Color(0xFF0f0f0f), Colors.black],
              ),
            ),
          ),

          // Botón volver
          Positioned(
            top: 40,
            left: 20,
            child: GestureDetector(
              onTap: () {
                Navigator.pushReplacement(
                  context,
                  MaterialPageRoute(builder: (_) => const WelcomePage()),
                );
              },
              child: Container(
                padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                decoration: BoxDecoration(
                  color: Colors.black.withOpacity(0.7),
                  border: Border.all(color: Colors.cyanAccent, width: 2),
                  borderRadius: BorderRadius.circular(4),
                  boxShadow: [
                    BoxShadow(
                      color: Colors.cyanAccent.withOpacity(0.3),
                      blurRadius: 6,
                      spreadRadius: 2,
                    ),
                  ],
                ),
                child: const Text(
                  '< VOLVER',
                  style: TextStyle(
                    fontFamily: 'PressStart2P',
                    fontSize: 10,
                    color: Colors.cyanAccent,
                  ),
                ),
              ),
            ),
          ),

          // Contenido central scrollable
          Center(
            child: SingleChildScrollView(
              padding: const EdgeInsets.symmetric(horizontal: 20),
              child: ScaleTransition(
                scale: _scaleAnimation,
                child: CustomPaint(
                  painter: _PixelBorderPainter(color: Colors.cyanAccent, pixelSize: 4),
                  child: Container(
                    width: 360,
                    padding: const EdgeInsets.all(24),
                    color: Colors.black.withOpacity(0.8),
                    child: Column(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        const Icon(Icons.videogame_asset, size: 50, color: Colors.cyanAccent),
                        const SizedBox(height: 12),
                        const Text(
                          "PIXEL STORE LOGIN",
                          textAlign: TextAlign.center,
                          style: TextStyle(
                            fontFamily: 'PressStart2P',
                            fontSize: 16,
                            color: Colors.cyanAccent,
                            shadows: [
                              Shadow(offset: Offset(2, 2), blurRadius: 4, color: Colors.black),
                            ],
                          ),
                        ),
                        const SizedBox(height: 20),
                        _buildRetroInput("Correo electrónico", emailController),
                        const SizedBox(height: 10),
                        _buildRetroInput("Contraseña", contrasenaController, obscureText: true),
                        const SizedBox(height: 20),
                        ElevatedButton(
                          style: ElevatedButton.styleFrom(
                            backgroundColor: Colors.transparent,
                            foregroundColor: Colors.cyanAccent,
                            side: const BorderSide(color: Colors.cyanAccent, width: 2),
                            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(4)),
                            padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 14),
                          ),
                          onPressed: isLoading ? null : _loginUsuario,
                          child: isLoading
                              ? const SizedBox(
                                  width: 24,
                                  height: 24,
                                  child: CircularProgressIndicator(color: Colors.cyanAccent, strokeWidth: 2),
                                )
                              : const Text(
                                  "INICIAR SESIÓN",
                                  style: TextStyle(
                                    fontFamily: 'PressStart2P',
                                    fontSize: 14,
                                  ),
                                ),
                        ),
                      ],
                    ),
                  ),
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildRetroInput(String hint, TextEditingController controller, {bool obscureText = false}) {
    return TextField(
      controller: controller,
      obscureText: obscureText,
      style: const TextStyle(
        fontFamily: 'PressStart2P',
        color: Colors.cyanAccent,
      ),
      decoration: InputDecoration(
        hintText: hint,
        hintStyle: const TextStyle(
          fontFamily: 'PressStart2P',
          color: Color.fromRGBO(0, 255, 255, 0.7),
        ),
        filled: true,
        fillColor: Colors.black.withOpacity(0.4),
        contentPadding: const EdgeInsets.symmetric(horizontal: 12, vertical: 12),
        enabledBorder: OutlineInputBorder(
          borderSide: const BorderSide(color: Colors.cyanAccent, width: 2),
          borderRadius: BorderRadius.circular(4),
        ),
        focusedBorder: OutlineInputBorder(
          borderSide: const BorderSide(color: Colors.white, width: 2),
          borderRadius: BorderRadius.circular(4),
        ),
      ),
    );
  }
}

// Borde retro pixelado
class _PixelBorderPainter extends CustomPainter {
  final Color color;
  final double pixelSize;

  const _PixelBorderPainter({required this.color, required this.pixelSize});

  @override
  void paint(Canvas canvas, Size size) {
    final paint = Paint()..color = color;

    for (double x = 0; x < size.width; x += pixelSize) {
      canvas.drawRect(Rect.fromLTWH(x, 0, pixelSize, pixelSize), paint);
      canvas.drawRect(Rect.fromLTWH(x, size.height - pixelSize, pixelSize, pixelSize), paint);
    }

    for (double y = 0; y < size.height; y += pixelSize) {
      canvas.drawRect(Rect.fromLTWH(0, y, pixelSize, pixelSize), paint);
      canvas.drawRect(Rect.fromLTWH(size.width - pixelSize, y, pixelSize, pixelSize), paint);
    }
  }

  @override
  bool shouldRepaint(covariant CustomPainter oldDelegate) => false;
}
