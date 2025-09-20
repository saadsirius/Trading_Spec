import { test, expect } from '@playwright/test';

test.describe('Trading Functionality', () => {
  test.beforeEach(async ({ page }) => {
    // Mock API responses
    await page.route('**/api/account', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          id: 'test-account',
          status: 'ACTIVE',
          buying_power: '10000.00',
          cash: '5000.00',
          portfolio_value: '15000.00'
        })
      });
    });

    await page.route('**/api/orders', async route => {
      if (route.request().method() === 'POST') {
        await route.fulfill({
          status: 201,
          contentType: 'application/json',
          body: JSON.stringify({
            id: 'test-order-id',
            symbol: 'AAPL',
            side: 'buy',
            qty: '10',
            type: 'market',
            status: 'new'
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

    await page.route('**/api/positions', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([])
      });
    });
  });

  test('should place a buy order', async ({ page }) => {
    await page.goto('/symbol/AAPL');
    
    // Wait for page to load
    await expect(page.locator('[data-testid="chart-container"]')).toBeVisible({ timeout: 10000 });
    
    // Click buy button
    await page.click('[data-testid="buy-button"]');
    
    // Fill order form
    await page.fill('[data-testid="quantity-input"]', '10');
    await page.selectOption('[data-testid="order-type"]', 'market');
    
    // Submit order
    await page.click('[data-testid="submit-order"]');
    
    // Verify success message
    await expect(page.locator('[data-testid="order-success"]')).toBeVisible();
  });

  test('should place a sell order', async ({ page }) => {
    await page.goto('/symbol/AAPL');
    
    // Wait for page to load
    await expect(page.locator('[data-testid="chart-container"]')).toBeVisible({ timeout: 10000 });
    
    // Click sell button
    await page.click('[data-testid="sell-button"]');
    
    // Fill order form
    await page.fill('[data-testid="quantity-input"]', '5');
    await page.selectOption('[data-testid="order-type"]', 'limit');
    await page.fill('[data-testid="limit-price"]', '150.00');
    
    // Submit order
    await page.click('[data-testid="submit-order"]');
    
    // Verify success message
    await expect(page.locator('[data-testid="order-success"]')).toBeVisible();
  });

  test('should validate order inputs', async ({ page }) => {
    await page.goto('/symbol/AAPL');
    
    // Wait for page to load
    await expect(page.locator('[data-testid="chart-container"]')).toBeVisible({ timeout: 10000 });
    
    // Click buy button
    await page.click('[data-testid="buy-button"]');
    
    // Try to submit without quantity
    await page.click('[data-testid="submit-order"]');
    
    // Verify validation error
    await expect(page.locator('[data-testid="quantity-error"]')).toBeVisible();
  });

  test('should display account balance', async ({ page }) => {
    await page.goto('/portfolio');
    
    // Wait for page to load
    await expect(page.locator('[data-testid="portfolio-container"]')).toBeVisible({ timeout: 10000 });
    
    // Check account balance display
    await expect(page.locator('[data-testid="buying-power"]')).toContainText('$10,000.00');
    await expect(page.locator('[data-testid="cash"]')).toContainText('$5,000.00');
    await expect(page.locator('[data-testid="portfolio-value"]')).toContainText('$15,000.00');
  });
});
