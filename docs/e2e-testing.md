# End-to-End Testing with Playwright

This document explains how to use Playwright for end-to-end testing in the Badge System project.

## Overview

End-to-end tests are an essential part of our testing strategy, allowing us to validate that our application works as expected from the user's perspective. These tests interact with the application just like a real user would, clicking buttons, filling forms, and verifying that the expected content appears.

We use [Playwright](https://playwright.dev/) as our end-to-end testing framework because it offers:

- Cross-browser testing (Chrome, Firefox, Safari)
- Mobile browser emulation
- Robust selectors and waiting mechanisms
- Fast execution
- Comprehensive reporting

## Test Structure

Our end-to-end tests are organized into the following categories:

1. **Rules Tests** (`e2e/rules/`): Tests for rule form creation, editing, listing, and deletion
2. **Accessibility Tests** (`e2e/accessibility/`): Tests to ensure our application is accessible
3. **Performance Tests** (`e2e/performance/`): Tests to measure and validate application performance
4. **Internationalization Tests** (`e2e/internationalization/`): Tests to verify i18n functionality

## Running Tests

### Prerequisites

- Node.js 18+ installed
- Project dependencies installed (`npm install`)
- Playwright browsers installed (`npx playwright install`)

### Running All Tests

To run all end-to-end tests:

```bash
npm run test:e2e
```

This will run all tests in headless mode across all configured browsers.

### Running Tests with UI

To run tests with the Playwright UI for debugging:

```bash
npm run test:e2e:ui
```

### Running Specific Test Suites

We have several npm scripts for running specific test suites:

- `npm run test:e2e:rules` - Run only rule-related tests
- `npm run test:e2e:accessibility` - Run only accessibility tests
- `npm run test:e2e:performance` - Run only performance tests
- `npm run test:e2e:i18n` - Run only internationalization tests
- `npm run test:e2e:mobile` - Run tests on mobile browser profiles

### Generating and Viewing Reports

To run tests and generate an HTML report:

```bash
npm run test:e2e:report
```

This will run all tests, generate an HTML report, and open it in your default browser.

## Writing Tests

### Test Structure

We follow a standard structure for our tests:

```typescript
import { test, expect } from '@playwright/test';

test.describe('Feature Name', () => {
  test.beforeEach(async ({ page }) => {
    // Setup code that runs before each test
  });

  test('should do something specific', async ({ page }) => {
    // Test implementation
  });
});
```

### Best Practices

1. **Make tests independent**: Each test should be able to run on its own without depending on other tests.
2. **Use descriptive test names**: Test names should clearly describe what functionality is being tested.
3. **Use page objects or helper functions**: Extract common functionality into helper functions or page objects.
4. **Avoid hard-coded waits**: Use Playwright's built-in waiting mechanisms instead of arbitrary timeouts.
5. **Test for accessibility**: Include tests that verify accessibility standards.
6. **Test on mobile viewports**: Ensure your application works well on different screen sizes.

### Selectors

Playwright offers multiple ways to select elements. In order of preference:

1. **Role-based selectors**: `page.getByRole('button', { name: 'Save' })`
2. **Text-based selectors**: `page.getByText('Welcome to Badge System')`
3. **Label-based selectors**: `page.getByLabel('Name')`
4. **Test ID selectors**: `page.getByTestId('submit-button')`
5. **CSS selectors**: `page.locator('.submit-button')`

### Example Test

Here's an example of a test that creates a new rule:

```typescript
test('should create a new rule', async ({ page }) => {
  // Navigate to the create rule page
  await page.goto('/admin/rules/new');
  
  // Fill in the form
  await page.getByLabel('Name').fill('Test Rule');
  await page.getByLabel('Description').fill('This is a test rule');
  await page.getByLabel('Type').selectOption('points');
  
  // Fill in type-specific fields
  await page.getByLabel('Minimum Points').fill('50');
  await page.getByRole('button', { name: 'Add Event' }).click();
  await page.getByLabel('Event Type').fill('login');
  await page.getByLabel('Points').fill('10');
  
  // Submit the form
  await page.getByRole('button', { name: 'Save' }).click();
  
  // Verify success message
  await expect(page.getByText('Rule created successfully')).toBeVisible();
  
  // Verify redirection to rules list
  await expect(page).toHaveURL('/admin/rules');
  
  // Verify the new rule appears in the list
  await expect(page.getByText('Test Rule')).toBeVisible();
});
```

## Continuous Integration

Our Playwright tests are configured to run in our CI pipeline on GitHub Actions. The configuration can be found in `.github/workflows/e2e-tests.yml`.

## Troubleshooting

### Common Issues

1. **Tests fail on CI but pass locally**: This could be due to different browser versions or environment differences. Try running tests with the same browser version locally.

2. **Flaky tests**: If tests sometimes pass and sometimes fail, it could be due to timing issues. Make sure you're using proper waiting mechanisms.

3. **Selector not found**: If a selector can't be found, make sure the element exists and is accessible. Use Playwright's debugging tools to inspect the page.

### Debugging

To debug tests:

1. **Use the UI mode**: `npm run test:e2e:ui`
2. **Use the Playwright Inspector**: Add `await page.pause()` in your test
3. **Take screenshots**: Use `await page.screenshot({ path: 'screenshot.png' })` to capture the page state

## Additional Resources

- [Playwright Documentation](https://playwright.dev/docs/intro)
- [Playwright API Reference](https://playwright.dev/docs/api/class-playwright)
- [Playwright Best Practices](https://playwright.dev/docs/best-practices)
