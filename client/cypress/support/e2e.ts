// Import commands.js using ES2015 syntax:
import './commands';

// Hide all fetch/XHR logs for cleaner output (optional)
Cypress.on('uncaught:exception', () => {
  // returning false here prevents Cypress from
  // failing the test on uncaught exceptions
  return false;
});
