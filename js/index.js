// Main entry point for Calendar Application
// Loads modules and initializes the application

// Import all the modules to ensure they're loaded
import './styles.js';
import './ui-components.js';
import './event-handlers.js';
import './utils.js';

// Import calendar.js last as it depends on the other modules
import './calendar.js';

// Log initialization to console
console.log('Calendar application initialized - ' + new Date().toISOString());
