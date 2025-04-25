import 'package:flutter/material.dart';

class SellerHomePage extends StatelessWidget {
  const SellerHomePage({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFF0f0f0f),
      appBar: AppBar(
        backgroundColor: Colors.black,
        title: const Text(
          'Panel del Vendedor',
          style: TextStyle(
            fontFamily: 'PressStart2P',
            fontSize: 14,
            color: Colors.cyanAccent,
          ),
        ),
        centerTitle: true,
        iconTheme: const IconThemeData(color: Colors.cyanAccent),
      ),
      body: Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            const Icon(Icons.storefront, size: 64, color: Colors.cyanAccent),
            const SizedBox(height: 20),
            const Text(
              'Bienvenido, Vendedor',
              style: TextStyle(
                fontFamily: 'PressStart2P',
                fontSize: 14,
                color: Colors.cyanAccent,
              ),
              textAlign: TextAlign.center,
            ),
            const SizedBox(height: 30),
            ElevatedButton(
              onPressed: () {
                // Aquí puedes poner lógica para ver productos, agregar, etc.
              },
              style: ElevatedButton.styleFrom(
                backgroundColor: Colors.transparent,
                foregroundColor: Colors.cyanAccent,
                side: const BorderSide(color: Colors.cyanAccent, width: 2),
                padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 14),
              ),
              child: const Text(
                'GESTIONAR PRODUCTOS',
                style: TextStyle(fontFamily: 'PressStart2P', fontSize: 10),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
