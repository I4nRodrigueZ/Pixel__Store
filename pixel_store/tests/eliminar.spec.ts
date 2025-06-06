import { test, expect } from '@playwright/test';

test('Eliminar juego Split Fiction desde admin y verificar en catálogo', async ({ page }) => {
  test.setTimeout(180000); // Timeout extendido para todo el flujo

  // Manejar TODOS los diálogos que aparezcan (confirm y alert)
  page.on('dialog', async dialog => {
    await dialog.accept();
  });

  // 1. Login
  await page.goto('http://localhost:5173/login');
  await page.fill('input[name="email"]', 'diegoelperron@gmail.com');
  await page.fill('input[name="password"]', 'superadmin123');
  await page.click('button[type="submit"]');
  await expect(page).toHaveURL('http://localhost:5173/administrador');

  // 2. Ir a juegos
  await page.click('a[href="/administrador/juegos"]');
  await expect(page).toHaveURL('http://localhost:5173/administrador/juegos');

  // 3. Buscar fila del juego
  const juegoFila = page.locator('tbody tr', { hasText: 'Split Fiction' });
  await expect(juegoFila).toBeVisible();

  // 4. Click en eliminar
  const eliminarBtn = juegoFila.locator('button.boton-eliminar');
  await eliminarBtn.click();

  // 5. Esperar que la fila desaparezca, con timeout más largo
  await juegoFila.waitFor({ state: 'detached', timeout: 10000 });

  // 6. Volver a administrador
  await page.click('button:has-text("Volver al Administrador")');
  await expect(page).toHaveURL('http://localhost:5173/administrador');

  // 7. Ir a catálogo
  await page.click('text=Catálogo');
  await expect(page).toHaveURL('http://localhost:5173/catalogo');

  // 8. Esperar juegos cargados y verificar que no esté el juego eliminado
  await page.waitForSelector('.juego-card');
  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
  await page.waitForTimeout(1000);

  const juegoEliminado = page.locator('.juego-card', { hasText: 'Split Fiction' });
  await expect(juegoEliminado).toHaveCount(0);
});
