import 'package:flutter/material.dart';
import 'api_service.dart';
import 'retro_login.dart'; // 🔹 Importa la pantalla de login

class RetroRegisterPage extends StatefulWidget {
  const RetroRegisterPage({super.key});

  @override
  State<RetroRegisterPage> createState() => _RetroRegisterPageState();
}

class _RetroRegisterPageState extends State<RetroRegisterPage> {
  final TextEditingController nombreController = TextEditingController();
  final TextEditingController apellidoController = TextEditingController();
  final TextEditingController emailController = TextEditingController();
  final TextEditingController passwordController = TextEditingController();
  final TextEditingController direccionController = TextEditingController();
  final TextEditingController telefonoController = TextEditingController();
  bool isLoading = false;

  @override
  void dispose() {
    nombreController.dispose();
    apellidoController.dispose();
    emailController.dispose();
    passwordController.dispose();
    direccionController.dispose();
    telefonoController.dispose();
    super.dispose();
  }

  Future<void> _registrarUsuario() async {
    setState(() => isLoading = true);

    final response = await ApiService.registerUser(
      nombre: nombreController.text,
      apellido: apellidoController.text,
      email: emailController.text,
      password: passwordController.text,
      direccion: direccionController.text,
      telefono: telefonoController.text,
      rol: 'usuario', // Se envía ocultamente, fijo como "usuario"
    );

    setState(() => isLoading = false);

    if (response.statusCode == 200 || response.statusCode == 201) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Usuario registrado exitosamente')),
      );

      // 🔹 Redirige al login
      Navigator.pushReplacement(
        context,
        MaterialPageRoute(builder: (context) => RetroLoginPage()), // 🔹 Cambié el nombre
      );
    } else {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Error: ${response.body}')),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Stack(
        children: [
          Container(color: Colors.black),
          Center(
            child: SingleChildScrollView(
              child: Container(
                width: 350,
                padding: const EdgeInsets.all(24),
                decoration: BoxDecoration(
                  borderRadius: BorderRadius.circular(8),
                  border: Border.all(color: Colors.cyanAccent, width: 2),
                  color: Colors.black.withOpacity(0.7),
                  boxShadow: [
                    BoxShadow(
                      color: Colors.cyanAccent.withOpacity(0.5),
                      blurRadius: 20,
                      spreadRadius: 5,
                    ),
                  ],
                ),
                child: Column(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    const Text(
                      "RETRO REGISTRO",
                      style: TextStyle(
                        fontFamily: 'PressStart2P',
                        fontSize: 20,
                        color: Colors.cyanAccent,
                        shadows: [
                          Shadow(
                            offset: Offset(2, 2),
                            blurRadius: 4,
                            color: Colors.black,
                          ),
                        ],
                      ),
                    ),
                    const SizedBox(height: 20),
                    _buildRetroInput("Nombre", nombreController),
                    const SizedBox(height: 10),
                    _buildRetroInput("Apellido", apellidoController),
                    const SizedBox(height: 10),
                    _buildRetroInput("Email", emailController),
                    const SizedBox(height: 10),
                    _buildRetroInput("Contraseña", passwordController, obscureText: true),
                    const SizedBox(height: 10),
                    _buildRetroInput("Dirección", direccionController),
                    const SizedBox(height: 10),
                    _buildRetroInput("Teléfono", telefonoController),
                    const SizedBox(height: 20),
                    ElevatedButton(
                      style: ElevatedButton.styleFrom(
                        padding: const EdgeInsets.symmetric(vertical: 12, horizontal: 24),
                        backgroundColor: Colors.transparent,
                        foregroundColor: Colors.cyanAccent,
                        side: const BorderSide(color: Colors.cyanAccent, width: 2),
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(4),
                        ),
                        elevation: 8,
                      ),
                      onPressed: isLoading ? null : _registrarUsuario,
                      child: isLoading
                          ? const CircularProgressIndicator(color: Colors.cyanAccent)
                          : const Text(
                              "REGISTRAR",
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
        fillColor: Colors.black.withOpacity(0.5),
        contentPadding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
        enabledBorder: OutlineInputBorder(
          borderSide: const BorderSide(color: Colors.cyanAccent, width: 2),
          borderRadius: BorderRadius.circular(4),
        ),
        focusedBorder: OutlineInputBorder(
          borderSide: const BorderSide(color: Colors.cyanAccent, width: 2),
          borderRadius: BorderRadius.circular(4),
        ),
      ),
    );
  }
}
