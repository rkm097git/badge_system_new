import { test, expect } from '@playwright/test';

/**
 * Test suite for the Rules Form page
 * 
 * Tests the functionality of creating and editing rules
 */
test.describe('Rules Form', () => {
  // Before each test, navigate to the rules creation page
  test.beforeEach(async ({ page }) => {
    await page.goto('/admin/rules/new');
    // Wait for the page to fully load
    await page.waitForSelector('h1');
  });

  test('should display the form with proper title and fields', async ({ page }) => {
    // Check that the page title is correct
    await expect(page.locator('h1')).toContainText('Create Rule');
    
    // Verify that the form fields are present
    await expect(page.getByLabel('Name')).toBeVisible();
    await expect(page.getByLabel('Description')).toBeVisible();
    await expect(page.getByLabel('Type')).toBeVisible();
  });

  test('should require name field to be filled', async ({ page }) => {
    // Try to submit the form without filling in the name
    await page.getByRole('button', { name: 'Save' }).click();
    
    // Check for validation error message
    await expect(page.getByText('Name is required')).toBeVisible();
  });

  test('should be able to select different rule types', async ({ page }) => {
    // Fill in the basic information
    await page.getByLabel('Name').fill('Test Rule');
    await page.getByLabel('Description').fill('This is a test rule');
    
    // Test selecting each type of rule
    const ruleTypes = ['points', 'direct', 'events', 'ranking'];
    
    for (const type of ruleTypes) {
      await page.getByLabel('Type').selectOption(type);
      
      // Verify that the type-specific form appears
      if (type === 'points') {
        await expect(page.getByText('Minimum Points')).toBeVisible();
        await expect(page.getByText('Types of Events Considered')).toBeVisible();
      } else if (type === 'direct') {
        await expect(page.getByText('Profiles')).toBeVisible();
      } else if (type === 'events') {
        await expect(page.getByText('Event Type')).toBeVisible();
        await expect(page.getByText('Minimum Count')).toBeVisible();
      } else if (type === 'ranking') {
        await expect(page.getByText('Ranking')).toBeVisible();
        await expect(page.getByText('Position')).toBeVisible();
      }
    }
  });

  test('should allow adding multiple event types for points rule', async ({ page }) => {
    // Fill in the basic information
    await page.getByLabel('Name').fill('Points Rule Test');
    await page.getByLabel('Description').fill('Tests adding multiple event types');
    
    // Select points rule type
    await page.getByLabel('Type').selectOption('points');
    
    // Add an event type
    await page.getByRole('button', { name: 'Add Event' }).click();
    await page.getByLabel('Event Type').nth(0).fill('login');
    await page.getByLabel('Points').nth(0).fill('10');
    
    // Add a second event type
    await page.getByRole('button', { name: 'Add Event' }).click();
    await page.getByLabel('Event Type').nth(1).fill('completion');
    await page.getByLabel('Points').nth(1).fill('20');
    
    // Verify both events are visible
    await expect(page.getByLabel('Event Type').nth(0)).toHaveValue('login');
    await expect(page.getByLabel('Points').nth(0)).toHaveValue('10');
    await expect(page.getByLabel('Event Type').nth(1)).toHaveValue('completion');
    await expect(page.getByLabel('Points').nth(1)).toHaveValue('20');
    
    // Fill in minimum points
    await page.getByLabel('Minimum Points').fill('25');
  });
});
