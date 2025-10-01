# End-to-End Testing with Playwright

This directory contains end-to-end tests for the Badge System project using Playwright.

## Structure

```
e2e/
├── accessibility/    # Accessibility tests
├── helpers/          # Test helper utilities 
├── internationalization/ # Internationalization tests
├── performance/      # Performance tests
├── rules/            # Tests for rule creation, editing, listing
└── scripts/          # Utility scripts for running tests
```

## Quick Start

### Prerequisites

- Node.js 18+
- npm or yarn
- Project dependencies installed

### Install Playwright browsers

```bash
npx playwright install
```

### Running Tests

Run all tests:
```bash
npm run test:e2e
```

Run with UI mode for debugging:
```bash
npm run test:e2e:ui
```

Generate and view HTML report:
```bash
npm run test:e2e:report
```

Run specific test suites:
```bash
# Run only rule-related tests
npm run test:e2e:rules

# Run only accessibility tests
npm run test:e2e:accessibility

# Run only performance tests
npm run test:e2e:performance

# Run only internationalization tests
npm run test:e2e:i18n

# Run tests on mobile browsers
npm run test:e2e:mobile
```

## Test Categories

### Rules Tests

Tests for the rule management functionality:
- Creating rules
- Editing rules
- Listing rules
- Deleting rules
- Form validation
- Different rule types

### Accessibility Tests

Tests to ensure the application meets accessibility standards:
- Keyboard navigation
- ARIA attributes
- Screen reader support
- Color contrast

### Performance Tests

Tests to measure and validate application performance:
- Page load times
- Form interaction responsiveness
- UI update speed
- Handling of large data sets

### Internationalization Tests

Tests to verify internationalization functionality:
- Text translation
- Date and number formatting
- RTL language support
- Unicode character handling

## Helper Utilities

The `helpers` directory contains utility classes to make tests more maintainable:

- `RuleUtils`: Helper methods for working with rules

See [E2E Testing Helpers Documentation](/docs/e2e-testing-helpers.md) for details on how to use these utilities.

## Documentation

For more detailed information, see:
- [E2E Testing Documentation](/docs/e2e-testing.md)
- [E2E Testing Helpers Documentation](/docs/e2e-testing-helpers.md)

## Continuous Integration

These tests are configured to run in our CI pipeline on GitHub Actions. The workflow definition is in `.github/workflows/e2e-tests.yml`.
