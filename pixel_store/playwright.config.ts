import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  timeout: 60000, // 1 minuto por test
  workers: 1, // Ejecutar tests en serie para mejor grabación
  
  use: {
    // Configuración de visualización
    headless: false,
    viewport: null, // Usará el tamaño máximo disponible
    ignoreHTTPSErrors: true,
    
    // Maximizar la ventana al iniciar
    launchOptions: {
      args: ['--start-maximized'],
      channel: 'chrome' // Usar Chrome instalado
    },
    
    // Grabación de video en alta calidad
    video: {
      mode: 'on', // Grabar todos los tests
      size: { width: 1920, height: 1080 } // Full HD
    },
    
    // Capturas en cada paso (opcional)
    screenshot: 'on',
    
    // Trazas detalladas
    trace: 'on'
  },

  // Configurar reporteros
  reporter: [
    ['list'], // Consola
    ['html', { 
      outputFolder: 'playwright-report',
      open: 'on-failure' // Abrir automáticamente solo si hay fallos
    }]
  ],

  // Opcional: Configurar proyectos para diferentes navegadores
  projects: [
    {
      name: 'chrome',
      use: { 
        browserName: 'chromium',
        launchOptions: {
          args: ['--start-maximized', '--window-size=1920,1080']
        }
      },
    }
  ]
});