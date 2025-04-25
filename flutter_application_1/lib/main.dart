import 'package:flutter/material.dart';
import 'welcome_page.dart';
import 'retro_login.dart';
import 'register_page.dart';

void main() {
  runApp(const MyApp());
}

class MyApp extends StatelessWidget {
  const MyApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      debugShowCheckedModeBanner: false,
      theme: ThemeData.dark().copyWith(
        scaffoldBackgroundColor: Colors.black,
      ),
      initialRoute: '/',
      routes: {
        '/': (context) => const WelcomePage(),
        '/login': (context) => const RetroLoginPage(),     // 💙 Aquí
  '/register': (context) => const RetroRegisterPage(),

      },
    );
  }
}
