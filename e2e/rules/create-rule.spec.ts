import { test, expect } from '@playwright/test';
import { RuleUtils } from '../helpers/rule-utils';

/**
 * End-to-end test suite for creating rules
 * 
 * Tests the complete flow of creating different types of rules and verifying
 * they appear in the rules list
 */
test.describe('Create Rule End-to-End', () => {
  let ruleUtils: RuleUtils;
  
  // Initialize the rule utilities and clean up after tests
  test.beforeEach(async ({ page }) => {
    ruleUtils = new RuleUtils(page);
  });
  
  test('should create a points rule and verify it appears in the list', async ({ page }) => {
    // Navigate to create rule page
    await page.goto('/admin/rules/new');
    
    // Create a points rule
    const ruleName = `Points Rule ${Date.now()}`;
    await ruleUtils.createPointsRule(
      ruleName,
      'A test points rule created by Playwright',
      50,
      [
        { type: 'login', points: 10 },
        { type: 'completion', points: 20 }
      ]
    );
    
    // Wait for toast notification showing success
    await expect(page.getByText('Rule created successfully')).toBeVisible();
    
    // Navigate to rules list
    await page.goto('/admin/rules');
    
    // Verify the rule appears in the list
    await expect(page.getByText(ruleName)).toBeVisible();
  });
  
  test('should create a direct assignment rule and verify it appears in the list', async ({ page }) => {
    // Navigate to create rule page
    await page.goto('/admin/rules/new');
    
    // Create a direct assignment rule
    const ruleName = `Direct Rule ${Date.now()}`;
    
    // Fill basic info
    await ruleUtils.fillBasicRuleInfo(
      ruleName,
      'A test direct assignment rule created by Playwright',
      'direct'
    );
    
    // Select profiles (implementation may need to be adjusted based on actual UI)
    await page.getByLabel('Profiles').selectOption(['student', 'teacher']);
    
    // Save the rule
    await page.getByRole('button', { name: 'Save' }).click();
    
    // Wait for toast notification showing success
    await expect(page.getByText('Rule created successfully')).toBeVisible();
    
    // Navigate to rules list
    await page.goto('/admin/rules');
    
    // Verify the rule appears in the list
    await expect(page.getByText(ruleName)).toBeVisible();
  });
  
  test('should create an events count rule and verify it appears in the list', async ({ page }) => {
    // Navigate to create rule page
    await page.goto('/admin/rules/new');
    
    // Create an events count rule
    const ruleName = `Events Rule ${Date.now()}`;
    await ruleUtils.createEventsRule(
      ruleName,
      'A test events count rule created by Playwright',
      'course_completion',
      5
    );
    
    // Wait for toast notification showing success
    await expect(page.getByText('Rule created successfully')).toBeVisible();
    
    // Navigate to rules list
    await page.goto('/admin/rules');
    
    // Verify the rule appears in the list
    await expect(page.getByText(ruleName)).toBeVisible();
  });
  
  test('should create a ranking rule and verify it appears in the list', async ({ page }) => {
    // Navigate to create rule page
    await page.goto('/admin/rules/new');
    
    // Create a ranking rule
    const ruleName = `Ranking Rule ${Date.now()}`;
    
    // Fill basic info
    await ruleUtils.fillBasicRuleInfo(
      ruleName,
      'A test ranking rule created by Playwright',
      'ranking'
    );
    
    // Select ranking and position (implementation may need to be adjusted based on actual UI)
    await page.getByLabel('Ranking').selectOption('course_completion');
    await page.getByLabel('Position').fill('3');
    
    // Save the rule
    await page.getByRole('button', { name: 'Save' }).click();
    
    // Wait for toast notification showing success
    await expect(page.getByText('Rule created successfully')).toBeVisible();
    
    // Navigate to rules list
    await page.goto('/admin/rules');
    
    // Verify the rule appears in the list
    await expect(page.getByText(ruleName)).toBeVisible();
  });
  
  test('should display validation errors when form is incomplete', async ({ page }) => {
    // Navigate to create rule page
    await page.goto('/admin/rules/new');
    
    // Try to save without filling any fields
    await page.getByRole('button', { name: 'Save' }).click();
    
    // Verify validation errors
    await expect(page.getByText('Name is required')).toBeVisible();
    
    // Fill name but leave description empty
    await page.getByLabel('Name').fill('Test Rule');
    await page.getByRole('button', { name: 'Save' }).click();
    
    // Verify type validation error
    await expect(page.getByText('Type is required')).toBeVisible();
    
    // Select type but don't fill type-specific fields
    await page.getByLabel('Type').selectOption('points');
    await page.getByRole('button', { name: 'Save' }).click();
    
    // Verify points-specific validation errors
    await expect(page.getByText('Minimum Points is required')).toBeVisible();
    await expect(page.getByText('At least one event must be added')).toBeVisible();
  });
  
  test('should edit an existing rule', async ({ page }) => {
    // First create a rule
    await page.goto('/admin/rules/new');
    
    const originalName = `Edit Test Rule ${Date.now()}`;
    await ruleUtils.createPointsRule(
      originalName,
      'Original description',
      50,
      [{ type: 'login', points: 10 }]
    );
    
    // Navigate to rules list
    await page.goto('/admin/rules');
    
    // Find the rule and click edit
    await page.getByText(originalName).first().click();
    await page.getByRole('button', { name: 'Edit' }).click();
    
    // Edit the rule
    const updatedName = `Updated Rule ${Date.now()}`;
    await page.getByLabel('Name').fill(updatedName);
    await page.getByLabel('Description').fill('Updated description');
    await page.getByLabel('Minimum Points').fill('75');
    
    // Save the changes
    await page.getByRole('button', { name: 'Save' }).click();
    
    // Wait for toast notification showing success
    await expect(page.getByText('Rule updated successfully')).toBeVisible();
    
    // Navigate to rules list
    await page.goto('/admin/rules');
    
    // Verify the updated rule appears and the old one doesn't
    await expect(page.getByText(updatedName)).toBeVisible();
    await expect(page.getByText(originalName)).not.toBeVisible();
  });
  
  test('should delete a rule', async ({ page }) => {
    // First create a rule
    await page.goto('/admin/rules/new');
    
    const ruleName = `Delete Test Rule ${Date.now()}`;
    await ruleUtils.createPointsRule(
      ruleName,
      'Rule to be deleted',
      50,
      [{ type: 'login', points: 10 }]
    );
    
    // Navigate to rules list
    await page.goto('/admin/rules');
    
    // Find the rule and click delete
    const rowLocator = page.getByText(ruleName).first().locator('..').locator('..');
    await rowLocator.getByRole('button', { name: 'Delete' }).click();
    
    // Confirm deletion
    await page.getByRole('button', { name: 'Confirm' }).click();
    
    // Wait for toast notification showing success
    await expect(page.getByText('Rule deleted successfully')).toBeVisible();
    
    // Verify the rule no longer appears
    await expect(page.getByText(ruleName)).not.toBeVisible();
  });
  
  test('should handle rule creation with special characters', async ({ page }) => {
    // Navigate to create rule page
    await page.goto('/admin/rules/new');
    
    // Create a rule with special characters
    const ruleName = `Special Rule & < > " ' ${Date.now()}`;
    await ruleUtils.createPointsRule(
      ruleName,
      'Rule with special characters: & < > " \'',
      50,
      [{ type: 'special_event<>', points: 10 }]
    );
    
    // Wait for toast notification showing success
    await expect(page.getByText('Rule created successfully')).toBeVisible();
    
    // Navigate to rules list
    await page.goto('/admin/rules');
    
    // Verify the rule appears in the list (escape special chars for selector if needed)
    await expect(page.getByText(ruleName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'))).toBeVisible();
  });
  
  test('should handle mobile view responsively', async ({ page }) => {
    // Set viewport to mobile size
    await page.setViewportSize({ width: 375, height: 667 });
    
    // Navigate to create rule page
    await page.goto('/admin/rules/new');
    
    // Verify page is responsive and form elements are visible
    await expect(page.locator('h1')).toBeVisible();
    await expect(page.getByLabel('Name')).toBeVisible();
    await expect(page.getByLabel('Description')).toBeVisible();
    await expect(page.getByLabel('Type')).toBeVisible();
    
    // Create a simple rule
    const ruleName = `Mobile Rule ${Date.now()}`;
    await ruleUtils.createPointsRule(
      ruleName,
      'Rule created on mobile view',
      50,
      [{ type: 'mobile_login', points: 10 }]
    );
    
    // Navigate to rules list
    await page.goto('/admin/rules');
    
    // Verify the rule appears in the list
    await expect(page.getByText(ruleName)).toBeVisible();
    
    // Check if mobile view specific elements are displayed
    // This will depend on your specific mobile UI implementation
    await expect(page.locator('.mobile-view-indicator, .card-view, .responsive-table').first()).toBeVisible();
  });
});
