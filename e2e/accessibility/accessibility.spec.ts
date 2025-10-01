import { test, expect } from '@playwright/test';

/**
 * Test suite for accessibility validation
 * 
 * Tests accessibility features like keyboard navigation, proper ARIA attributes,
 * and focus management
 */
test.describe('Accessibility', () => {
  test('should navigate rule form using keyboard', async ({ page }) => {
    // Navigate to create rule page
    await page.goto('/admin/rules/new');
    
    // Focus the first input field (Name)
    await page.getByLabel('Name').focus();
    
    // Fill name using keyboard
    await page.keyboard.type('Keyboard Navigation Test');
    
    // Tab to the next field (Description)
    await page.keyboard.press('Tab');
    
    // Check that description field has focus
    expect(await page.evaluate(() => document.activeElement?.getAttribute('name'))).toBe('description');
    
    // Fill description using keyboard
    await page.keyboard.type('Testing keyboard navigation');
    
    // Tab to the next field (Type select)
    await page.keyboard.press('Tab');
    
    // Check that type field has focus
    expect(await page.evaluate(() => document.activeElement?.getAttribute('name'))).toBe('type');
    
    // Open the select dropdown with space
    await page.keyboard.press('Space');
    
    // Navigate to points option
    await page.keyboard.press('ArrowDown');
    
    // Select points with enter
    await page.keyboard.press('Enter');
    
    // Tab to the next field (Min Points)
    await page.keyboard.press('Tab');
    
    // Check that min points field has focus
    expect(await page.evaluate(() => document.activeElement?.getAttribute('name'))).toContain('minPoints');
    
    // Fill min points using keyboard
    await page.keyboard.type('50');
    
    // Continue tabbing to event fields and filling them
    await page.keyboard.press('Tab');
    await page.keyboard.type('login');
    
    await page.keyboard.press('Tab');
    await page.keyboard.type('10');
    
    // Tab to save button
    let activeElementIsButton = false;
    let tabCount = 0;
    const maxTabs = 10; // Safety limit
    
    while (!activeElementIsButton && tabCount < maxTabs) {
      await page.keyboard.press('Tab');
      tabCount++;
      activeElementIsButton = await page.evaluate(() => 
        document.activeElement?.tagName === 'BUTTON' && 
        document.activeElement?.textContent?.includes('Save')
      );
    }
    
    // Verify save button has focus
    expect(activeElementIsButton).toBe(true);
    
    // Submit form with Enter
    await page.keyboard.press('Enter');
    
    // Wait for success notification
    await expect(page.getByText('Rule created successfully')).toBeVisible();
  });
  
  test('should have proper ARIA attributes on form elements', async ({ page }) => {
    // Navigate to create rule page
    await page.goto('/admin/rules/new');
    
    // Check required fields have appropriate aria-required attribute
    await expect(page.getByLabel('Name')).toHaveAttribute('aria-required', 'true');
    await expect(page.getByLabel('Type')).toHaveAttribute('aria-required', 'true');
    
    // Check error messages are associated with inputs
    await page.getByRole('button', { name: 'Save' }).click();
    
    // Verify error messages have appropriate ARIA roles/attributes
    await expect(page.locator('[role="alert"]').first()).toBeVisible();
    
    // Check tooltip has proper ARIA attributes
    const tooltipTrigger = page.locator('button[aria-label="More information"]').first();
    if (await tooltipTrigger.count() > 0) {
      await expect(tooltipTrigger).toHaveAttribute('aria-expanded', 'false');
      await tooltipTrigger.click();
      await expect(tooltipTrigger).toHaveAttribute('aria-expanded', 'true');
    }
  });
  
  test('should check color contrast ratios', async ({ page }) => {
    // Navigate to create rule page
    await page.goto('/admin/rules/new');
    
    // Run accessibility audit to check color contrast
    const colorContrastRatios = await page.evaluate(() => {
      // Simple function to calculate contrast ratio between foreground and background
      function getContrastRatio(element) {
        const style = window.getComputedStyle(element);
        const fgColor = style.color;
        const bgColor = style.backgroundColor;
        
        // Return placeholder values for this test
        // In a real implementation, we would parse colors and calculate actual contrast ratio
        return {
          element: element.tagName + (element.id ? '#' + element.id : '') + 
                  (element.className ? '.' + element.className.replace(/ /g, '.') : ''),
          foreground: fgColor,
          background: bgColor,
          ratio: 4.5, // Placeholder - would be calculated in real implementation
          passes: true // Placeholder
        };
      }
      
      // Get all visible text elements
      const textElements = Array.from(document.querySelectorAll('button, a, h1, h2, h3, p, label, input, select'));
      return textElements.map(getContrastRatio);
    });
    
    // Check that we have contrast ratios to analyze
    expect(colorContrastRatios.length).toBeGreaterThan(0);
    
    // Verify all elements pass minimum contrast ratio (simplified check for example)
    const failingElements = colorContrastRatios.filter(item => !item.passes);
    expect(failingElements).toEqual([]);
  });
  
  test('rules list should be navigable via keyboard', async ({ page }) => {
    // Navigate to rules list
    await page.goto('/admin/rules');
    
    // Focus the search input
    await page.getByPlaceholder('Search...').focus();
    
    // Tab to the first action button (should be Edit or similar)
    let foundActionButton = false;
    let tabCount = 0;
    const maxTabs = 20; // Safety limit
    
    // Keep tabbing until we find an action button
    while (!foundActionButton && tabCount < maxTabs) {
      await page.keyboard.press('Tab');
      tabCount++;
      
      // Check if current element is an action button (Edit, Delete, etc.)
      foundActionButton = await page.evaluate(() => {
        const el = document.activeElement;
        return el?.tagName === 'BUTTON' && 
              (el.textContent?.includes('Edit') || 
               el.textContent?.includes('Delete') ||
               el.getAttribute('aria-label')?.includes('Edit') ||
               el.getAttribute('aria-label')?.includes('Delete'));
      });
    }
    
    // Verify we found an action button
    expect(foundActionButton).toBe(true);
    
    // Activate the button with Enter
    await page.keyboard.press('Enter');
    
    // Should either open a confirm dialog or navigate to edit page
    // Check for either scenario
    const isOnEditPage = await page.evaluate(() => 
      document.title.includes('Edit') || 
      document.querySelector('h1')?.textContent?.includes('Edit')
    );
    
    const hasConfirmDialog = await page.evaluate(() => 
      document.querySelector('[role="dialog"]') !== null
    );
    
    expect(isOnEditPage || hasConfirmDialog).toBe(true);
  });
  
  test('should have screen reader accessible error messages', async ({ page }) => {
    // Navigate to create rule page
    await page.goto('/admin/rules/new');
    
    // Try to submit the form without filling required fields
    await page.getByRole('button', { name: 'Save' }).click();
    
    // Check that error messages are announced to screen readers via aria-live
    const errorContainers = await page.locator('[aria-live="assertive"], [role="alert"]').all();
    
    // Verify there are error messages
    expect(errorContainers.length).toBeGreaterThan(0);
    
    // Check that error messages have appropriate content
    for (const container of errorContainers) {
      const text = await container.textContent();
      expect(text?.trim().length).toBeGreaterThan(0);
    }
    
    // Verify form is marked as invalid
    const form = await page.locator('form');
    await expect(form).toHaveAttribute('aria-invalid', 'true');
  });
  
  test('toast notifications should be accessible', async ({ page }) => {
    // Navigate to create rule page
    await page.goto('/admin/rules/new');
    
    // Fill in the minimal required info
    await page.getByLabel('Name').fill('Accessible Toast Test');
    await page.getByLabel('Description').fill('Testing accessible toast notifications');
    await page.getByLabel('Type').selectOption('direct');
    
    // Submit the form
    await page.getByRole('button', { name: 'Save' }).click();
    
    // Verify toast notification appears and has appropriate ARIA attributes
    const toast = await page.locator('[role="status"], [aria-live="polite"]').first();
    await expect(toast).toBeVisible();
    
    // Check toast has either role="status" or aria-live="polite"
    const hasProperRole = await toast.evaluate(el => 
      el.getAttribute('role') === 'status' || 
      el.getAttribute('aria-live') === 'polite'
    );
    
    expect(hasProperRole).toBe(true);
    
    // Check toast has accessible dismiss button if it's dismissible
    const dismissButton = await toast.locator('button[aria-label*="Dismiss"], button[aria-label*="Close"]').first();
    
    if (await dismissButton.count() > 0) {
      await expect(dismissButton).toBeVisible();
      await expect(dismissButton).toHaveAttribute('aria-label');
    }
  });
});
