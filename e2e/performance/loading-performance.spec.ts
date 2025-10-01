import { test, expect } from '@playwright/test';

/**
 * Test suite for measuring and validating application performance
 * 
 * Tests page load performance, rendering speed, and interaction responsiveness
 */
test.describe('Performance', () => {
  test('rules list page should load within performance budget', async ({ page }) => {
    // Start performance measurement
    const startTime = Date.now();
    
    // Navigate to rules list page
    const response = await page.goto('/admin/rules');
    
    // Wait for page to be fully loaded and rendered
    await page.waitForSelector('h1');
    await page.waitForLoadState('networkidle');
    
    // Calculate total load time
    const loadTime = Date.now() - startTime;
    
    // Verify page loads within acceptable time (e.g., 3 seconds)
    expect(loadTime).toBeLessThan(3000);
    
    // Check server response time
    expect(response?.status()).toBe(200);
    const serverTiming = response?.timing();
    if (serverTiming) {
      // Verify server response time is within budget
      const serverResponseTime = serverTiming.responseEnd - serverTiming.requestStart;
      expect(serverResponseTime).toBeLessThan(1000);
    }
    
    // Check time to first contentful paint using performance API
    const firstPaint = await page.evaluate(() => {
      return new Promise(resolve => {
        // Wait a moment to ensure the performance entries are available
        setTimeout(() => {
          const perfEntries = performance.getEntriesByType('paint');
          const firstContentfulPaint = perfEntries.find(entry => entry.name === 'first-contentful-paint');
          resolve(firstContentfulPaint ? firstContentfulPaint.startTime : null);
        }, 100);
      });
    });
    
    if (firstPaint) {
      // First contentful paint should be less than 1.5 seconds
      expect(Number(firstPaint)).toBeLessThan(1500);
    }
  });

  test('rule form should render quickly after navigation', async ({ page }) => {
    // First load rules list
    await page.goto('/admin/rules');
    await page.waitForLoadState('networkidle');
    
    // Measure time to load the rule creation form
    const startTime = Date.now();
    await page.getByRole('link', { name: 'New Rule' }).click();
    
    // Wait for the form to be fully loaded
    await page.waitForSelector('form');
    await page.waitForLoadState('networkidle');
    
    // Calculate navigation time
    const navigationTime = Date.now() - startTime;
    
    // Verify navigation time is within acceptable range (e.g., 1 second)
    expect(navigationTime).toBeLessThan(1000);
    
    // Check that first input field is ready for interaction
    await page.getByLabel('Name').focus();
    await expect(page.getByLabel('Name')).toBeFocused();
  });

  test('rule type selection should update form quickly', async ({ page }) => {
    // Navigate to rule creation page
    await page.goto('/admin/rules/new');
    await page.waitForLoadState('networkidle');
    
    // Fill basic info
    await page.getByLabel('Name').fill('Performance Test');
    await page.getByLabel('Description').fill('Testing form responsiveness');
    
    // Measure time to update form when selecting rule type
    const startTime = Date.now();
    await page.getByLabel('Type').selectOption('points');
    
    // Wait for type-specific fields to appear
    await page.waitForSelector('input[name*="minPoints"]');
    
    // Calculate update time
    const updateTime = Date.now() - startTime;
    
    // Verify form updates within acceptable time (e.g., 500ms)
    expect(updateTime).toBeLessThan(500);
    
    // Repeat for another rule type
    const startTime2 = Date.now();
    await page.getByLabel('Type').selectOption('direct');
    
    // Wait for direct assignment specific fields
    await page.waitForSelector('div[role="group"]:has-text("Profiles")');
    
    // Calculate update time
    const updateTime2 = Date.now() - startTime2;
    
    // Verify form updates within acceptable time
    expect(updateTime2).toBeLessThan(500);
  });

  test('adding and removing events should be responsive', async ({ page }) => {
    // Navigate to rule creation page
    await page.goto('/admin/rules/new');
    
    // Select points rule type
    await page.getByLabel('Name').fill('Event Performance Test');
    await page.getByLabel('Type').selectOption('points');
    
    // Measure time to add a new event
    const startAddTime = Date.now();
    await page.getByRole('button', { name: 'Add Event' }).click();
    
    // Wait for the new event fields to appear
    const eventFieldsSelector = 'div[role="group"]:has-text("Event Type")';
    await page.waitForSelector(`${eventFieldsSelector}:nth-of-type(1)`);
    
    // Calculate add time
    const addTime = Date.now() - startAddTime;
    
    // Verify adding an event is responsive
    expect(addTime).toBeLessThan(300);
    
    // Fill in event details
    await page.getByLabel('Event Type').nth(0).fill('event1');
    await page.getByLabel('Points').nth(0).fill('10');
    
    // Add another event
    await page.getByRole('button', { name: 'Add Event' }).click();
    await page.waitForSelector(`${eventFieldsSelector}:nth-of-type(2)`);
    
    // Fill second event
    await page.getByLabel('Event Type').nth(1).fill('event2');
    await page.getByLabel('Points').nth(1).fill('20');
    
    // Measure time to remove an event
    const startRemoveTime = Date.now();
    await page.getByRole('button', { name: 'Remove Event' }).nth(1).click();
    
    // Wait for the event to be removed (check if only one event remains)
    await expect(page.getByLabel('Event Type')).toHaveCount(1);
    
    // Calculate remove time
    const removeTime = Date.now() - startRemoveTime;
    
    // Verify removing an event is responsive
    expect(removeTime).toBeLessThan(300);
  });

  test('search functionality should be responsive', async ({ page }) => {
    // Navigate to rules list
    await page.goto('/admin/rules');
    await page.waitForLoadState('networkidle');
    
    // Get current number of rules displayed
    const initialRulesCount = await page.locator('tbody tr').count();
    
    // Skip test if there are no rules
    if (initialRulesCount === 0) {
      test.skip();
      return;
    }
    
    // Get text from first rule to use as search term
    const firstRuleText = await page.locator('tbody tr').first().locator('td').first().textContent();
    const searchTerm = firstRuleText?.substring(0, 3) || '';
    
    // Measure search response time
    const startSearchTime = Date.now();
    await page.getByPlaceholder('Search...').fill(searchTerm);
    await page.keyboard.press('Enter');
    
    // Wait for search results to update
    await page.waitForTimeout(500); // Allow time for search to process
    
    // Calculate search time
    const searchTime = Date.now() - startSearchTime;
    
    // Verify search is responsive
    expect(searchTime).toBeLessThan(1000);
    
    // Verify search returned results
    const searchResultsCount = await page.locator('tbody tr').count();
    expect(searchResultsCount).toBeGreaterThan(0);
  });

  test('should handle rendering large lists efficiently', async ({ page }) => {
    // This test can be more meaningful if you have or can create a large dataset
    // For demonstration, we'll check if the rules list scales well
    
    // Navigate to rules list
    await page.goto('/admin/rules');
    await page.waitForLoadState('networkidle');
    
    // Measure frame rate during scrolling
    const frameStats = await page.evaluate(() => {
      return new Promise(resolve => {
        let lastFrameTime = performance.now();
        let frameCount = 0;
        let totalFrameTime = 0;
        
        // We'll measure for about 1 second
        const endTime = performance.now() + 1000;
        
        function countFrame() {
          if (performance.now() < endTime) {
            const now = performance.now();
            const frameDuration = now - lastFrameTime;
            totalFrameTime += frameDuration;
            frameCount++;
            lastFrameTime = now;
            
            // Schedule next frame calculation
            requestAnimationFrame(countFrame);
          } else {
            // Calculate average frame rate
            const averageFrameTime = totalFrameTime / frameCount;
            const frameRate = 1000 / averageFrameTime;
            resolve({ frameRate, frameCount });
          }
        }
        
        // Start measuring frames
        requestAnimationFrame(countFrame);
        
        // Scroll the page
        const scrollDistance = document.body.scrollHeight;
        const scrollStep = scrollDistance / 10;
        let currentScroll = 0;
        
        const scrollInterval = setInterval(() => {
          if (currentScroll < scrollDistance) {
            window.scrollBy(0, scrollStep);
            currentScroll += scrollStep;
          } else {
            clearInterval(scrollInterval);
          }
        }, 100);
      });
    });
    
    // Verify the frame rate is acceptable (above 30fps for smooth scrolling)
    expect(frameStats.frameRate).toBeGreaterThanOrEqual(30);
  });

  test('form validation should be responsive', async ({ page }) => {
    // Navigate to rule creation page
    await page.goto('/admin/rules/new');
    
    // Fill and then clear a required field to trigger validation
    await page.getByLabel('Name').fill('Test');
    await page.getByLabel('Name').clear();
    
    // Measure time for validation error to appear
    const startTime = Date.now();
    await page.getByLabel('Name').blur(); // Lose focus to trigger validation
    
    // Wait for validation error to appear
    await expect(page.locator('text=Name is required')).toBeVisible();
    
    // Calculate validation response time
    const validationTime = Date.now() - startTime;
    
    // Verify validation is responsive (e.g., less than 200ms)
    expect(validationTime).toBeLessThan(200);
  });

  test('rule creation should be responsive under load', async ({ page }) => {
    // Navigate to rule creation page
    await page.goto('/admin/rules/new');
    
    // Create a complex points rule with multiple events
    await page.getByLabel('Name').fill('Load Test Rule');
    await page.getByLabel('Description').fill('Testing performance under load');
    await page.getByLabel('Type').selectOption('points');
    await page.getByLabel('Minimum Points').fill('100');
    
    // Add multiple events to increase form complexity
    for (let i = 0; i < 5; i++) {
      if (i > 0) {
        await page.getByRole('button', { name: 'Add Event' }).click();
      }
      await page.getByLabel('Event Type').nth(i).fill(`event${i}`);
      await page.getByLabel('Points').nth(i).fill((i * 10).toString());
    }
    
    // Measure form submission time
    const startSubmitTime = Date.now();
    await page.getByRole('button', { name: 'Save' }).click();
    
    // Wait for submission to complete and toast to appear
    await expect(page.getByText('Rule created successfully')).toBeVisible();
    
    // Calculate submission time
    const submitTime = Date.now() - startSubmitTime;
    
    // Verify form submission is responsive even with complex data
    expect(submitTime).toBeLessThan(2000);
  });
});
