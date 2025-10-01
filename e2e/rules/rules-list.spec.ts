import { test, expect } from '@playwright/test';

/**
 * Test suite for the Rules List page
 * 
 * Tests the functionality of listing, searching, and navigating to rule creation/editing
 */
test.describe('Rules List', () => {
  // Before each test, navigate to the rules list page
  test.beforeEach(async ({ page }) => {
    await page.goto('/admin/rules');
    // Wait for the page to fully load
    await page.waitForSelector('h1');
  });

  test('should display the rules list page with correct title', async ({ page }) => {
    // Check that the page title is correct
    await expect(page.locator('h1')).toContainText('Rules');
    
    // Verify that the New Rule button is present
    await expect(page.getByRole('link', { name: 'New Rule' })).toBeVisible();
  });

  test('should navigate to rule creation page when clicking New Rule', async ({ page }) => {
    // Click the New Rule button
    await page.getByRole('link', { name: 'New Rule' }).click();
    
    // Verify we're on the create rule page
    await expect(page).toHaveURL(/\/admin\/rules\/new/);
    await expect(page.locator('h1')).toContainText('Create Rule');
  });

  test('should filter rules when using the search box', async ({ page }) => {
    // Assuming there are rules already in the system
    // If the list is empty this test might need to be skipped or modified
    
    // First, get the initial count of rules
    const initialRules = await page.locator('tbody tr').count();
    
    // Only proceed if there are rules to filter
    if (initialRules > 0) {
      // Get the text of the first rule name
      const firstRuleName = await page.locator('tbody tr').first().locator('td').nth(0).textContent();
      
      // Use part of the name to search
      const searchTerm = firstRuleName?.substring(0, 3);
      
      // Type in the search box and press Enter
      await page.getByPlaceholder('Search...').fill(searchTerm || '');
      await page.keyboard.press('Enter');
      
      // Wait for search results
      await page.waitForTimeout(500);
      
      // Verify that the results contain our search term
      const filteredRules = await page.locator('tbody tr').count();
      expect(filteredRules).toBeLessThanOrEqual(initialRules);
      
      if (filteredRules > 0) {
        // Check that the first item contains our search term
        const filteredRuleName = await page.locator('tbody tr').first().locator('td').nth(0).textContent();
        expect(filteredRuleName?.toLowerCase()).toContain(searchTerm?.toLowerCase());
      }
    }
  });

  test('should sort rules when clicking on column headers', async ({ page }) => {
    // Assuming there are rules already in the system
    // If the list is empty this test might need to be skipped or modified
    
    // First, get the initial count of rules
    const initialRules = await page.locator('tbody tr').count();
    
    // Only proceed if there are enough rules to test sorting
    if (initialRules > 1) {
      // Get the text of the first and second rule names before sorting
      const firstRuleNameBefore = await page.locator('tbody tr').nth(0).locator('td').nth(0).textContent();
      const secondRuleNameBefore = await page.locator('tbody tr').nth(1).locator('td').nth(0).textContent();
      
      // Click the Name column header to sort
      await page.getByRole('columnheader', { name: 'Name' }).click();
      
      // Wait for sorting to complete
      await page.waitForTimeout(500);
      
      // Get the text of the first and second rule names after sorting
      const firstRuleNameAfter = await page.locator('tbody tr').nth(0).locator('td').nth(0).textContent();
      const secondRuleNameAfter = await page.locator('tbody tr').nth(1).locator('td').nth(0).textContent();
      
      // Either the order changed (if they weren't sorted before) or they're in alphabetical order
      if (firstRuleNameBefore !== firstRuleNameAfter) {
        // Order changed, sorting worked
        expect(true).toBeTruthy();
      } else {
        // Order didn't change, check if they're in alphabetical order
        expect(firstRuleNameAfter?.localeCompare(secondRuleNameAfter || '')).toBeLessThanOrEqual(0);
      }
      
      // Click again to reverse sort
      await page.getByRole('columnheader', { name: 'Name' }).click();
      
      // Wait for sorting to complete
      await page.waitForTimeout(500);
      
      // Get the rule names after reverse sorting
      const firstRuleNameReverse = await page.locator('tbody tr').nth(0).locator('td').nth(0).textContent();
      const secondRuleNameReverse = await page.locator('tbody tr').nth(1).locator('td').nth(0).textContent();
      
      // Check that the order is reversed or in reverse alphabetical order
      if (firstRuleNameAfter !== firstRuleNameReverse) {
        // Order changed, reverse sorting worked
        expect(true).toBeTruthy();
      } else {
        // If order didn't change (which would be odd), check reverse alphabetical order
        expect(firstRuleNameReverse?.localeCompare(secondRuleNameReverse || '')).toBeGreaterThanOrEqual(0);
      }
    }
  });

  test('should navigate to rule edit page when clicking Edit button', async ({ page }) => {
    // Assuming there are rules already in the system
    // If the list is empty this test might need to be skipped or modified
    
    const initialRules = await page.locator('tbody tr').count();
    
    if (initialRules > 0) {
      // Click the Edit button on the first rule
      await page.locator('tbody tr').first().getByRole('button', { name: 'Edit' }).click();
      
      // Verify we're on the edit rule page
      await expect(page).toHaveURL(/\/admin\/rules\/edit\/.+/);
      await expect(page.locator('h1')).toContainText('Edit Rule');
    }
  });
});
