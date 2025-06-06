import { test, expect } from '@playwright/test';

test('Flujo completo de publicación de reseña', async ({ page }) => {
  test.setTimeout(180000); // 100s para todo el flujo

  // 1. Login
  await page.goto('http://localhost:5173/login');
  await page.fill('input[name="email"]', 'diego1069432917@gmail.com');
  await page.fill('input[name="password"]', 'diego2006');
  await page.click('button[type="submit"]');
  await expect(page).toHaveURL('http://localhost:5173/catalogo');

  // 2. Seleccionar el juego
  await page.waitForSelector('.juego-card');
  const firstProduct = page.locator('.juego-card').nth(6); // 7º juego
  await firstProduct.locator('text=🛒 Comprar').click();
  await expect(page).toHaveURL(/\/detalle\//);

  // 3. Ir a la sección de reseñas
  const seccionResenas = page.locator('.resenas-section');
  await seccionResenas.scrollIntoViewIfNeeded();
  await expect(seccionResenas).toBeVisible();

  // 4. Mostrar el formulario de reseña
  await page.locator('button.add-resena-button').click();
  const formResena = page.locator('form.resena-form');
  await expect(formResena).toBeVisible();

  // 5. Seleccionar puntuación (hover + click)
  const estrellas = page.locator('.star-rating-input svg'); // O svg si es el caso
  await expect(estrellas).toHaveCount(5); // Asegura que hay 5 estrellas

  const cuartaEstrella = estrellas.nth(3); // Índice 3 = 4ª estrella
  await cuartaEstrella.hover(); // Hover para activar el estado visual
  await cuartaEstrella.click(); // Click para seleccionar

  // 6. Rellenar comentario
  const comentario = 'Este juego es increíble, me encantó!';
  const comentarioArea = page.locator('textarea[name="comentario"]');
  await comentarioArea.fill(comentario);

  // 7. Enviar reseña
  const submitButton = page.locator('button.submit-resena-button');
  await expect(submitButton).toBeEnabled();
  await submitButton.click();

  // 8. Verificar reseña publicada
  const resenaCards = page.locator('.resena-card');
  await expect(resenaCards).toContainText(comentario);
  await expect(page.locator('.resena-user-name')).toBeVisible();

  // 9. Captura de pantalla
  await page.screenshot({ path: 'resena-publicada.png' });
});
