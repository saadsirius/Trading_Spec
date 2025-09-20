import { test, expect } from '@playwright/test';

test.describe('Basic Page Loading', () => {
  test('should load the home page', async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    
    // Check if the page loads
    await expect(page.locator('body')).toBeVisible();
  });

  test('should load the symbol page', async ({ page }) => {
    await page.goto('/symbol/AAPL', { waitUntil: 'domcontentloaded' });
    
    // Check if the page loads and has the basic structure
    await expect(page.locator('h1')).toContainText('AAPL');
    await expect(page.locator('[data-testid="chart-container"]')).toBeVisible();
  });

  test('should load the OHLC API endpoint', async ({ page }) => {
    const response = await page.request.get('/api/ohlc?symbol=AAPL');
    expect(response.status()).toBe(200);
    
    const data = await response.json();
    expect(data).toHaveProperty('symbol', 'AAPL');
    expect(data).toHaveProperty('candles');
    expect(Array.isArray(data.candles)).toBe(true);
  });
});
