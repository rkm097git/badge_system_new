#!/bin/bash

# Run accessibility tests
npx playwright test accessibility/ --reporter=html
