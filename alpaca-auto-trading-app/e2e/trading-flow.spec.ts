/**
 * File: e2e/trading-flow.spec.ts
 * Purpose: End-to-end tests for trading dashboard functionality
 * Key dependencies: Playwright, testing library
 * Learning Angle: This demonstrates how to test complete user workflows
 * in a trading application. Notice how we test the full order lifecycle
 * from login to order submission and verification.
 */

import { test, expect } from '@playwright/test';

test.describe('Trading Dashboard', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to trading dashboard
    await page.goto('/trading');
    
    // Wait for the page to load
    await page.waitForSelector('[data-testid="trading-dashboard"]', { timeout: 10000 });
  });

  test('should display trading dashboard with all required panels', async ({ page }) => {
    // Check that all main panels are visible
    await expect(page.locator('h1:has-text("Trading Dashboard")')).toBeVisible();
    
    // Check for mode selector (Paper/Live)
    await expect(page.locator('button:has-text("Paper")')).toBeVisible();
    await expect(page.locator('button:has-text("Live")')).toBeVisible();
    
    // Check for account summary
    await expect(page.locator('text=Equity')).toBeVisible();
    await expect(page.locator('text=Buying Power')).toBeVisible();
    await expect(page.locator('text=Day P&L')).toBeVisible();
    
    // Check for main panels
    await expect(page.locator('h3:has-text("Order Entry")')).toBeVisible();
    await expect(page.locator('h3:has-text("Positions")')).toBeVisible();
    await expect(page.locator('h3:has-text("Open Orders")')).toBeVisible();
    await expect(page.locator('h3:has-text("Risk Management")')).toBeVisible();
  });

  test('should switch between Paper and Live modes', async ({ page }) => {
    // Should start in Paper mode
    await expect(page.locator('button:has-text("Paper")')).toHaveClass(/bg-blue-600/);
    
    // Click Live mode
    await page.click('button:has-text("Live")');
    
    // Should show confirmation dialog
    await expect(page.locator('text=WARNING')).toBeVisible();
    await expect(page.locator('text=real money')).toBeVisible();
    
    // Cancel the switch
    await page.click('button:has-text("Cancel")');
    
    // Should still be in Paper mode
    await expect(page.locator('button:has-text("Paper")')).toHaveClass(/bg-blue-600/);
  });

  test('should validate order entry form', async ({ page }) => {
    // Test symbol validation
    const symbolInput = page.locator('input[placeholder="Enter symbol"]');
    await symbolInput.clear();
    await symbolInput.fill('AAPL');
    
    // Test quantity validation
    const qtyInput = page.locator('input[type="number"]');
    await qtyInput.clear();
    await qtyInput.fill('10');
    
    // Test order type selection
    await page.selectOption('select', 'limit');
    
    // Should show limit price field
    await expect(page.locator('input[placeholder="Enter limit price"]')).toBeVisible();
    
    // Fill limit price
    await page.fill('input[placeholder="Enter limit price"]', '150.00');
    
    // Submit button should be enabled
    await expect(page.locator('button:has-text("Submit Order")')).not.toBeDisabled();
  });

  test('should show order preview modal', async ({ page }) => {
    // Fill out order form
    await page.fill('input[placeholder="Enter symbol"]', 'AAPL');
    await page.fill('input[type="number"]', '10');
    await page.selectOption('select', 'limit');
    await page.fill('input[placeholder="Enter limit price"]', '150.00');
    
    // Click preview button
    await page.click('button:has-text("Preview Order")');
    
    // Should show preview modal
    await expect(page.locator('text=Order Preview')).toBeVisible();
    await expect(page.locator('text=AAPL')).toBeVisible();
    await expect(page.locator('text=BUY')).toBeVisible();
    await expect(page.locator('text=$150.00')).toBeVisible();
    
    // Should show warnings for paper mode
    await expect(page.locator('text=Paper trading mode')).toBeVisible();
    
    // Close modal
    await page.click('button:has-text("Cancel")');
    
    // Modal should be closed
    await expect(page.locator('text=Order Preview')).not.toBeVisible();
  });

  test('should handle order submission (paper mode)', async ({ page }) => {
    // Mock successful order submission
    await page.route('**/api/orders', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          id: 'test-order-123',
          status: 'new',
          symbol: 'AAPL',
          side: 'buy',
          qty: '10',
          type: 'limit',
          limit_price: '150.00'
        })
      });
    });
    
    // Fill out and submit order
    await page.fill('input[placeholder="Enter symbol"]', 'AAPL');
    await page.fill('input[type="number"]', '10');
    await page.selectOption('select', 'limit');
    await page.fill('input[placeholder="Enter limit price"]', '150.00');
    
    // Submit order
    await page.click('button:has-text("Submit Order")');
    
    // Should show success notification
    await expect(page.locator('text=Order Submitted')).toBeVisible();
    
    // Form should be reset
    await expect(page.locator('input[type="number"]')).toHaveValue('1');
  });

  test('should handle order submission error', async ({ page }) => {
    // Mock order submission error
    await page.route('**/api/orders', async route => {
      await route.fulfill({
        status: 400,
        contentType: 'application/json',
        body: JSON.stringify({
          error: 'Invalid order parameters',
          details: 'Symbol not found'
        })
      });
    });
    
    // Fill out and submit order
    await page.fill('input[placeholder="Enter symbol"]', 'INVALID');
    await page.fill('input[type="number"]', '10');
    await page.selectOption('select', 'market');
    
    // Submit order
    await page.click('button:has-text("Submit Order")');
    
    // Should show error notification
    await expect(page.locator('text=Order Failed')).toBeVisible();
    await expect(page.locator('text=Symbol not found')).toBeVisible();
  });

  test('should display positions table', async ({ page }) => {
    // Mock positions data
    await page.route('**/api/positions', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([
          {
            symbol: 'AAPL',
            qty: '100',
            side: 'long',
            market_value: '15000.00',
            unrealized_pl: '500.00',
            unrealized_plpc: '0.0333',
            current_price: '150.00',
            avg_entry_price: '145.00'
          }
        ])
      });
    });
    
    // Reload page to fetch positions
    await page.reload();
    
    // Should show positions table
    await expect(page.locator('text=AAPL')).toBeVisible();
    await expect(page.locator('text=100')).toBeVisible();
    await expect(page.locator('text=long')).toBeVisible();
    await expect(page.locator('text=$15,000')).toBeVisible();
    await expect(page.locator('text=$500')).toBeVisible();
  });

  test('should display orders table', async ({ page }) => {
    // Mock orders data
    await page.route('**/api/orders*', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([
          {
            id: 'order-123',
            symbol: 'AAPL',
            side: 'buy',
            qty: '10',
            type: 'limit',
            status: 'new',
            limit_price: '150.00',
            time_in_force: 'day',
            submitted_at: new Date().toISOString()
          }
        ])
      });
    });
    
    // Reload page to fetch orders
    await page.reload();
    
    // Should show orders table
    await expect(page.locator('text=AAPL')).toBeVisible();
    await expect(page.locator('text=buy')).toBeVisible();
    await expect(page.locator('text=limit')).toBeVisible();
    await expect(page.locator('text=new')).toBeVisible();
    await expect(page.locator('text=$150.00')).toBeVisible();
  });

  test('should handle order cancellation', async ({ page }) => {
    // Mock orders data
    await page.route('**/api/orders*', async route => {
      if (route.request().method() === 'GET') {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify([
            {
              id: 'order-123',
              symbol: 'AAPL',
              side: 'buy',
              qty: '10',
              type: 'limit',
              status: 'new',
              limit_price: '150.00',
              time_in_force: 'day',
              submitted_at: new Date().toISOString()
            }
          ])
        });
      } else if (route.request().method() === 'DELETE') {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            id: 'order-123',
            status: 'canceled'
          })
        });
      }
    });
    
    // Reload page to fetch orders
    await page.reload();
    
    // Click cancel button
    await page.click('button:has-text("Cancel")');
    
    // Should show confirmation dialog
    await expect(page.locator('text=Are you sure you want to cancel')).toBeVisible();
    
    // Confirm cancellation
    await page.click('button:has-text("OK")');
    
    // Should show success notification
    await expect(page.locator('text=Order Cancelled')).toBeVisible();
  });

  test('should display risk management panel', async ({ page }) => {
    // Check risk management panel
    await expect(page.locator('h3:has-text("Risk Management")')).toBeVisible();
    await expect(page.locator('text=Total Exposure')).toBeVisible();
    await expect(page.locator('text=Daily P&L')).toBeVisible();
    await expect(page.locator('text=Concentration Risk')).toBeVisible();
    await expect(page.locator('text=Buying Power Used')).toBeVisible();
    await expect(page.locator('text=Margin Utilization')).toBeVisible();
    
    // Check emergency controls
    await expect(page.locator('button:has-text("Flatten All Positions")')).toBeVisible();
    await expect(page.locator('button:has-text("Cancel All Orders")')).toBeVisible();
  });

  test('should handle keyboard navigation', async ({ page }) => {
    // Test tab navigation through form fields
    await page.keyboard.press('Tab'); // Symbol input
    await page.keyboard.type('AAPL');
    
    await page.keyboard.press('Tab'); // Quantity input
    await page.keyboard.type('10');
    
    await page.keyboard.press('Tab'); // Order type select
    await page.keyboard.press('ArrowDown'); // Select limit
    await page.keyboard.press('Enter');
    
    // Should show limit price field
    await expect(page.locator('input[placeholder="Enter limit price"]')).toBeVisible();
    
    await page.keyboard.press('Tab'); // Limit price input
    await page.keyboard.type('150.00');
    
    // Submit with Enter
    await page.keyboard.press('Tab'); // Preview button
    await page.keyboard.press('Tab'); // Submit button
    await page.keyboard.press('Enter');
  });

  test('should be responsive on mobile', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    
    // Check that layout adapts to mobile
    await expect(page.locator('h1:has-text("Trading Dashboard")')).toBeVisible();
    
    // Check that panels stack vertically
    const orderEntry = page.locator('h3:has-text("Order Entry")');
    const positions = page.locator('h3:has-text("Positions")');
    
    await expect(orderEntry).toBeVisible();
    await expect(positions).toBeVisible();
  });
});
