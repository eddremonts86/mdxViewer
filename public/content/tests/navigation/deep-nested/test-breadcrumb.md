# Test Breadcrumb Navigation

This document is located at `tests/navigation/deep-nested/test-breadcrumb.md` and is used to test the breadcrumb navigation functionality.

## Navigation Test

When viewing this document, the breadcrumb should show:

- Home
- tests
- navigation
- deep-nested
- test-breadcrumb (current, active)

The "Back" button should navigate to the parent folder (which currently goes to Home since we don't have dedicated folder pages).

## Features Tested

1. **Breadcrumb Generation**: Proper path parsing and segment creation
2. **Back Navigation**: Clicking the back button should navigate to the previous breadcrumb item
3. **View Transitions**: Smooth navigation between pages
4. **Type Icons**: Proper icons for root, folder, and file types
5. **Active State**: Current document should be marked as active

## Expected Behavior

- Clicking "Home" should navigate to "/"
- Clicking "tests", "navigation", or "deep-nested" should navigate to "/" (home) since folder pages don't exist
- Clicking "Back" should navigate to the previous breadcrumb item
- The current document should be highlighted as active
