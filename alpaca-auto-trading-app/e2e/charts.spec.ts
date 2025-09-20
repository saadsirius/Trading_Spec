import { test, expect } from '@playwright/test';

test.describe('Charts Functionality', () => {
  test.beforeEach(async ({ page }) => {
    // ✅ Mock the API endpoints the chart needs (adapt paths to your app).
    // If your page fetches /api/market/price?symbol=AAPL or /api/ohlc?symbol=AAPL, mock them here.
    await page.route('**/api/**', async route => {
      const url = route.request().url();
      if (url.includes('/api/ohlc') || url.includes('/api/market/price')) {
        // Return deterministic candle/price data so the chart paints quickly.
        return route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            symbol: 'AAPL',
            candles: Array.from({ length: 90 }, (_, i) => ({
              t: Math.floor(Date.now() / 1000) - (90 - i) * 86400,
              o: 180 + Math.sin(i / 9) * 2,
              h: 182 + Math.sin(i / 9) * 2,
              l: 178 + Math.sin(i / 9) * 2,
              c: 181 + Math.sin(i / 9) * 2,
              v: 1_000_000 + i * 1_000,
            })),
            last: 181.12,
          }),
        });
      }
      // Default passthrough for other APIs
      return route.continue();
    });
  });

  test('should display chart with price data', async ({ page }) => {
    // ✅ baseURL defined in config, so relative goto works reliably
    await page.goto('/symbol/AAPL', { waitUntil: 'domcontentloaded' });

    // Wait for the chart container to be visible (provided by page.tsx)
    const container = page.getByTestId('chart-container');
    await expect(container).toBeVisible();

    // Then, wait for the actual chart element we render (equity-chart)
    await expect(page.getByTestId('equity-chart')).toBeVisible();

    // Optional: assert that skeleton disappears (if you remove it after load)
    // await expect(page.getByRole('status')).toBeHidden({ timeout: 10_000 });
  });

  test('should add technical indicators', async ({ page }) => {
    await page.goto('/symbol/AAPL');
    
    // Wait for chart to load
    await expect(page.locator('[data-testid="chart-container"]')).toBeVisible({ timeout: 10000 });
    
    // Click on indicators button
    await page.click('[data-testid="indicators-button"]');
    
    // Add RSI indicator
    await page.click('[data-testid="rsi-indicator"]');
    
    // Verify RSI panel is added
    await expect(page.locator('[data-testid="rsi-panel"]')).toBeVisible();
  });

  test('should switch timeframes', async ({ page }) => {
    await page.goto('/symbol/AAPL');
    
    // Wait for chart to load
    await expect(page.locator('[data-testid="chart-container"]')).toBeVisible({ timeout: 10000 });
    
    // Switch to 1H timeframe
    await page.click('[data-testid="timeframe-1h"]');
    
    // Verify timeframe change
    await expect(page.locator('[data-testid="active-timeframe"]')).toHaveText('1H');
  });

  test('should handle chart zoom and pan', async ({ page }) => {
    await page.goto('/symbol/AAPL');
    
    // Wait for chart to load
    await expect(page.locator('[data-testid="chart-container"]')).toBeVisible({ timeout: 10000 });
    
    const chart = page.locator('[data-testid="chart-container"]');
    
    // Test zoom in
    await chart.hover();
    await page.mouse.wheel(0, -100);
    
    // Test pan
    await chart.hover();
    await page.mouse.down();
    await page.mouse.move(100, 0);
    await page.mouse.up();
    
    // Chart should still be visible after interactions
    await expect(chart).toBeVisible();
  });
});
