import { test, expect } from '@playwright/test';

test.describe('Backtesting Functionality', () => {
  test.beforeEach(async ({ page }) => {
    // Mock API responses
    await page.route('**/api/backtest', async route => {
      if (route.request().method() === 'POST') {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            id: 'test-backtest-id',
            status: 'completed',
            results: {
              totalReturn: 15.5,
              sharpeRatio: 1.2,
              maxDrawdown: -8.3,
              winRate: 65.0,
              totalTrades: 45,
              equityCurve: [
                { date: '2024-01-01', value: 10000 },
                { date: '2024-01-02', value: 10100 },
                { date: '2024-01-03', value: 10200 }
              ]
            }
          })
        });
      } else {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify([])
        });
      }
    });

    await page.route('**/api/market-data/**', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          bars: Array.from({ length: 100 }, (_, i) => ({
            time: Date.now() - (100 - i) * 3600000,
            open: 100 + Math.random() * 10,
            high: 105 + Math.random() * 10,
            low: 95 + Math.random() * 10,
            close: 100 + Math.random() * 10,
            volume: 1000 + Math.random() * 500
          }))
        })
      });
    });
  });

  test('should run a simple backtest', async ({ page }) => {
    await page.goto('/symbol/AAPL');
    
    // Wait for page to load
    await expect(page.locator('[data-testid="chart-container"]')).toBeVisible({ timeout: 10000 });
    
    // Click backtest button
    await page.click('[data-testid="backtest-button"]');
    
    // Configure backtest
    await page.selectOption('[data-testid="strategy-select"]', 'sma-crossover');
    await page.fill('[data-testid="start-date"]', '2024-01-01');
    await page.fill('[data-testid="end-date"]', '2024-12-31');
    await page.fill('[data-testid="initial-capital"]', '10000');
    
    // Run backtest
    await page.click('[data-testid="run-backtest"]');
    
    // Wait for results
    await expect(page.locator('[data-testid="backtest-results"]')).toBeVisible({ timeout: 15000 });
    
    // Verify key metrics
    await expect(page.locator('[data-testid="total-return"]')).toContainText('15.5%');
    await expect(page.locator('[data-testid="sharpe-ratio"]')).toContainText('1.2');
    await expect(page.locator('[data-testid="max-drawdown"]')).toContainText('-8.3%');
  });

  test('should display equity curve chart', async ({ page }) => {
    await page.goto('/symbol/AAPL');
    
    // Wait for page to load
    await expect(page.locator('[data-testid="chart-container"]')).toBeVisible({ timeout: 10000 });
    
    // Run a quick backtest
    await page.click('[data-testid="backtest-button"]');
    await page.selectOption('[data-testid="strategy-select"]', 'rsi-mean-reversion');
    await page.click('[data-testid="run-backtest"]');
    
    // Wait for results
    await expect(page.locator('[data-testid="backtest-results"]')).toBeVisible({ timeout: 15000 });
    
    // Check equity curve chart
    await expect(page.locator('[data-testid="equity-curve-chart"]')).toBeVisible();
  });

  test('should export backtest results', async ({ page }) => {
    await page.goto('/symbol/AAPL');
    
    // Wait for page to load
    await expect(page.locator('[data-testid="chart-container"]')).toBeVisible({ timeout: 10000 });
    
    // Run a backtest
    await page.click('[data-testid="backtest-button"]');
    await page.selectOption('[data-testid="strategy-select"]', 'bollinger-bands');
    await page.click('[data-testid="run-backtest"]');
    
    // Wait for results
    await expect(page.locator('[data-testid="backtest-results"]')).toBeVisible({ timeout: 15000 });
    
    // Export CSV
    const downloadPromise = page.waitForEvent('download');
    await page.click('[data-testid="export-csv"]');
    const download = await downloadPromise;
    
    expect(download.suggestedFilename()).toMatch(/backtest.*\.csv$/);
  });

  test('should validate backtest parameters', async ({ page }) => {
    await page.goto('/symbol/AAPL');
    
    // Wait for page to load
    await expect(page.locator('[data-testid="chart-container"]')).toBeVisible({ timeout: 10000 });
    
    // Click backtest button
    await page.click('[data-testid="backtest-button"]');
    
    // Try to run with invalid dates
    await page.fill('[data-testid="start-date"]', '2024-12-31');
    await page.fill('[data-testid="end-date"]', '2024-01-01');
    await page.click('[data-testid="run-backtest"]');
    
    // Verify validation error
    await expect(page.locator('[data-testid="date-error"]')).toBeVisible();
  });
});
