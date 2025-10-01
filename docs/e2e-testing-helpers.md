# Playwright Testing Helpers

This document explains the helper utilities available for end-to-end testing in the Badge System project.

## Rule Utilities

The `RuleUtils` class (`e2e/helpers/rule-utils.ts`) provides helper methods for working with rules in tests.

### Usage

Import and initialize the utils in your test:

```typescript
import { test, expect } from '@playwright/test';
import { RuleUtils } from '../helpers/rule-utils';

test('my test', async ({ page }) => {
  const ruleUtils = new RuleUtils(page);
  // Use the utils...
});
```

### Available Methods

#### `fillBasicRuleInfo(name, description, type)`

Fills in the basic rule information in the form.

```typescript
await ruleUtils.fillBasicRuleInfo(
  'Test Rule',
  'This is a test rule',
  'points'
);
```

#### `createPointsRule(name, description, minPoints, events)`

Creates a complete points rule with the given parameters.

```typescript
await ruleUtils.createPointsRule(
  'Points Rule',
  'A rule based on points',
  50,
  [
    { type: 'login', points: 10 },
    { type: 'completion', points: 20 }
  ]
);
```

#### `createDirectRule(name, description, profiles)`

Creates a direct assignment rule with the specified profiles.

```typescript
await ruleUtils.createDirectRule(
  'Direct Rule',
  'A direct assignment rule',
  ['student', 'teacher']
);
```

#### `createEventsRule(name, description, eventType, minCount)`

Creates an events count rule.

```typescript
await ruleUtils.createEventsRule(
  'Events Rule',
  'A rule based on event count',
  'course_completion',
  5
);
```

#### `createRankingRule(name, description, ranking, position)`

Creates a ranking rule.

```typescript
await ruleUtils.createRankingRule(
  'Ranking Rule',
  'A rule based on ranking position',
  'course_completion',
  3
);
```

#### `deleteRule(ruleName)`

Deletes a rule by its name.

```typescript
await ruleUtils.deleteRule('Test Rule');
```

## Test Categories

Our end-to-end tests are organized into categories to make them easier to maintain and run:

### Rules Tests

These tests verify the functionality of rule creation, editing, listing, and deletion. They ensure that:

- Forms render correctly
- Validation works as expected
- Data is saved correctly
- Rules can be edited and deleted
- The rules list displays and filters correctly

### Accessibility Tests

These tests ensure our application meets accessibility standards:

- Keyboard navigation works properly
- ARIA attributes are correctly set
- Color contrast meets standards
- Screen reader support is implemented
- Focus management is handled properly

### Performance Tests

These tests measure and validate application performance:

- Page load times are within acceptable ranges
- Form interactions are responsive
- UI updates happen quickly after user actions
- The application handles large data sets efficiently
- The application remains responsive under load

### Internationalization Tests

These tests verify our application works correctly in different languages:

- Text is properly translated
- Date and number formats respect the locale
- RTL languages are supported (if applicable)
- Unicode characters are handled correctly
- Language can be changed dynamically

## Mobile Testing

We also test our application on mobile viewports to ensure a responsive experience. The mobile tests check:

- Responsive design at different screen sizes
- Touch-friendly interactions
- Mobile-specific UI elements
- Performance on mobile devices

## Creating New Test Helpers

When creating new test helpers, follow these guidelines:

1. **Keep them focused**: Each helper should do one thing well.
2. **Make them reusable**: Helpers should be applicable in multiple tests.
3. **Document them**: Add JSDoc comments to explain parameters and behavior.
4. **Add them to this documentation**: Update this document when adding new helpers.

## Example: Creating a Test Helper

Here's an example of how to create a new test helper:

```typescript
/**
 * Helper class for working with the search functionality
 */
export class SearchUtils {
  private page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  /**
   * Search for a term and wait for results
   * 
   * @param searchTerm - The term to search for
   * @returns The number of results found
   */
  async search(searchTerm: string): Promise<number> {
    await this.page.getByPlaceholder('Search...').fill(searchTerm);
    await this.page.keyboard.press('Enter');
    
    // Wait for search results to update
    await this.page.waitForTimeout(500);
    
    // Return the count of results
    return await this.page.locator('tbody tr').count();
  }
}
```

## Best Practices for Using Helpers

1. **Don't overuse**: Use helpers for common operations, but write test-specific code directly in tests.
2. **Keep tests readable**: The purpose of helpers is to make tests more readable and maintainable.
3. **Test the helpers**: If helpers contain complex logic, consider testing them separately.
4. **Update helpers when the UI changes**: Keep helpers in sync with the application UI.
