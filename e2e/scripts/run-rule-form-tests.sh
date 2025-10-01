#!/bin/bash

# Run only the rule form tests
npx playwright test rules/rule-form.spec.ts --reporter=html
