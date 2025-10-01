#!/bin/bash

# Run tests across all major browsers
npx playwright test --project=chromium --project=firefox --project=webkit --reporter=html
