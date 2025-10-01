#!/bin/bash

# Run tests on mobile browsers
npx playwright test --project="Mobile Chrome" --project="Mobile Safari" --reporter=html
