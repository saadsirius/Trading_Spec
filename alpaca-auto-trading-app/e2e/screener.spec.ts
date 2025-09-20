import { test, expect } from '@playwright/test';

test.describe('Screener Functionality', () => {
  test.beforeEach(async ({ page }) => {
    // Mock API responses
    await page.route('**/api/screener', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          results: [
            {
              symbol: 'AAPL',
              name: 'Apple Inc.',
              price: 150.25,
              change: 2.15,
              changePercent: 1.45,
              volume: 45000000,
              marketCap: 2500000000000,
              momentum: 75.5,
              value: 65.2,
              quality: 85.3,
              risk: 45.8,
              growth: 70.1
            },
            {
              symbol: 'MSFT',
              name: 'Microsoft Corporation',
              price: 320.50,
              change: -1.25,
              changePercent: -0.39,
              volume: 25000000,
              marketCap: 2400000000000,
              momentum: 68.2,
              value: 58.7,
              quality: 88.1,
              risk: 42.3,
              growth: 72.5
            }
          ],
          total: 2,
          page: 1,
          limit: 50
        })
      });
    });
  });

  test('should display screener results', async ({ page }) => {
    await page.goto('/screener');
    
    // Wait for page to load
    await expect(page.locator('[data-testid="screener-container"]')).toBeVisible({ timeout: 10000 });
    
    // Check if results are displayed
    await expect(page.locator('[data-testid="screener-results"]')).toBeVisible();
    
    // Verify table headers
    await expect(page.locator('th:has-text("Symbol")')).toBeVisible();
    await expect(page.locator('th:has-text("Price")')).toBeVisible();
    await expect(page.locator('th:has-text("Momentum")')).toBeVisible();
    await expect(page.locator('th:has-text("Value")')).toBeVisible();
    
    // Check if data rows are present
    await expect(page.locator('[data-testid="screener-row"]')).toHaveCount(2);
  });

  test('should filter by momentum score', async ({ page }) => {
    await page.goto('/screener');
    
    // Wait for page to load
    await expect(page.locator('[data-testid="screener-container"]')).toBeVisible({ timeout: 10000 });
    
    // Set momentum filter
    await page.fill('[data-testid="momentum-min"]', '70');
    await page.fill('[data-testid="momentum-max"]', '100');
    
    // Apply filters
    await page.click('[data-testid="apply-filters"]');
    
    // Wait for filtered results
    await expect(page.locator('[data-testid="screener-results"]')).toBeVisible();
    
    // Verify only AAPL is shown (momentum 75.5 > 70)
    await expect(page.locator('[data-testid="screener-row"]')).toHaveCount(1);
    await expect(page.locator('td:has-text("AAPL")')).toBeVisible();
  });

  test('should sort by different columns', async ({ page }) => {
    await page.goto('/screener');
    
    // Wait for page to load
    await expect(page.locator('[data-testid="screener-container"]')).toBeVisible({ timeout: 10000 });
    
    // Sort by price descending
    await page.click('[data-testid="sort-price"]');
    
    // Verify MSFT is first (higher price)
    const firstRow = page.locator('[data-testid="screener-row"]').first();
    await expect(firstRow.locator('td:has-text("MSFT")')).toBeVisible();
    
    // Sort by momentum ascending
    await page.click('[data-testid="sort-momentum"]');
    
    // Verify MSFT is first (lower momentum)
    const firstRowAfterSort = page.locator('[data-testid="screener-row"]').first();
    await expect(firstRowAfterSort.locator('td:has-text("MSFT")')).toBeVisible();
  });

  test('should open symbol chart from screener', async ({ page }) => {
    await page.goto('/screener');
    
    // Wait for page to load
    await expect(page.locator('[data-testid="screener-container"]')).toBeVisible({ timeout: 10000 });
    
    // Click on AAPL symbol
    await page.click('[data-testid="symbol-link-AAPL"]');
    
    // Verify navigation to symbol page
    await expect(page).toHaveURL(/\/symbol\/AAPL/);
    await expect(page.locator('[data-testid="chart-container"]')).toBeVisible({ timeout: 10000 });
  });

  test('should save and load filter presets', async ({ page }) => {
    await page.goto('/screener');
    
    // Wait for page to load
    await expect(page.locator('[data-testid="screener-container"]')).toBeVisible({ timeout: 10000 });
    
    // Set up a custom filter
    await page.fill('[data-testid="momentum-min"]', '70');
    await page.fill('[data-testid="value-min"]', '60');
    await page.fill('[data-testid="quality-min"]', '80');
    
    // Save preset
    await page.fill('[data-testid="preset-name"]', 'High Quality Growth');
    await page.click('[data-testid="save-preset"]');
    
    // Verify preset is saved
    await expect(page.locator('[data-testid="preset-saved"]')).toBeVisible();
    
    // Load preset
    await page.selectOption('[data-testid="load-preset"]', 'High Quality Growth');
    
    // Verify filters are applied
    await expect(page.locator('[data-testid="momentum-min"]')).toHaveValue('70');
    await expect(page.locator('[data-testid="value-min"]')).toHaveValue('60');
    await expect(page.locator('[data-testid="quality-min"]')).toHaveValue('80');
  });
});
