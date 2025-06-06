import { test, expect } from '@playwright/test';

test('Flujo completo de compra con navegación al carrito', async ({ page }) => {
  // Configuración con timeout extendido
  test.setTimeout(180000); // 3 minutos para todo el flujo

  // 1. Login
  await page.goto('http://localhost:5173/login');
  await page.fill('input[name="email"]', 'diegoelperron@gmail.com');
  await page.fill('input[name="password"]', 'superadmin123');
  await page.click('button[type="submit"]');
  await expect(page).toHaveURL('http://localhost:5173/administrador');

  // 2. Ir al catálogo
  await page.click('text=Catálogo');
  await expect(page).toHaveURL('http://localhost:5173/catalogo');
  
  // 3. Seleccionar el primer producto
  await page.waitForSelector('.juego-card');
  const firstProduct = page.locator('.juego-card').first();
  const productName = await firstProduct.locator('h2').innerText();
  
  // Hacer clic en el botón de comprar
  await firstProduct.locator('text=🛒 Comprar').click();
  await expect(page).toHaveURL(/\/detalle\//);

  // 4. Agregar al carrito
  const addToCartButton = page.locator('button:has-text("Añadir al carrito")');
  await addToCartButton.waitFor({ state: 'visible' });
  await addToCartButton.click();

  // 5. Esperar y cerrar el modal de confirmación
  const modalSelector = '.alert-modal:has-text("¡Producto agregado al carrito con éxito!")';
  await page.locator(modalSelector).waitFor({ state: 'visible', timeout: 15000 });
  await page.click(`${modalSelector} >> text=Continuar comprando`);

  // 6. Navegar al carrito
  await page.goto('http://localhost:5173/carrito');
  await expect(page).toHaveURL('http://localhost:5173/carrito');
  await page.waitForSelector('.carrito-item', { state: 'visible' });

  // 7. Verificar producto en carrito
  await expect(page.locator('.carrito-item')).toContainText(productName, { timeout: 10000 });
  
  // 8. Proceder al pago
  await page.click('text=Proceder al pago');
  await expect(page).toHaveURL('http://localhost:5173/facturas');

  // 9. Completar formulario de pago - VERSIÓN MEJORADA
  // Esperar a que el formulario esté completamente cargado
  await page.waitForSelector('form.payment-form', { state: 'attached', timeout: 20000 });
  
  // SOLUCIÓN PRINCIPAL: Selector alternativo para el método de pago
  const paymentMethodSelector = 'select[class*="form-control"]:has(option:has-text("Nequi"))';
  await page.waitForSelector(paymentMethodSelector, { state: 'visible', timeout: 20000 });
  
  // Tomar screenshot para debug
  await page.screenshot({ path: 'before-payment-method-select.png' });
  
  // Seleccionar método de pago
  await page.selectOption(paymentMethodSelector, { label: 'Nequi' });
  
  // Rellenar número de teléfono
  const phoneInput = page.locator('input[placeholder*="3001234567"]');
  await phoneInput.waitFor({ state: 'visible' });
  await phoneInput.fill('3101234567');
  
  // Esperar a que el botón de confirmar esté habilitado
  const confirmButton = page.locator('button:has-text("Confirmar Pago"):not([disabled])');
  await confirmButton.waitFor({ state: 'visible', timeout: 15000 });
  
  // Hacer clic y esperar la generación de factura
  await Promise.all([
    page.waitForURL(/\/factura\//, { timeout: 30000 }),
    confirmButton.click()
  ]);

  // 10. Verificar factura generada
  await expect(page.locator('text=Factura #')).toBeVisible({ timeout: 15000 });
  await expect(page.locator(`text=${productName}`)).toBeVisible();
});