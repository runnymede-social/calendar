// Utility functions for Calendar Application
// Contains helper functions for various tasks

// Prevent zoom on mobile inputs
export function preventZoom(e) {
  const t2 = e.timeStamp;
  const t1 = e.currentTarget.dataset.lastTouch || t2;
  const dt = t2 - t1;
  const fingers = e.touches.length;
  
  e.currentTarget.dataset.lastTouch = t2;
  
  if (!dt || dt > 500 || fingers > 1) return; // Not double-tap
  
  e.preventDefault();
  e.target.click();
}

// Function to force calendar size rendering
export function forceCalendarSize(calendarEl, isMobile) {
  if (!isMobile) {
    // Force calendar to be large on desktop
    calendarEl.style.height = '800px';
    
    // Select all relevant container elements and force them to be large
    const viewHarness = document.querySelector('.fc-view-harness');
    if (viewHarness) viewHarness.style.height = '750px';
    
    const dayCells = document.querySelectorAll('.fc-daygrid-day');
    dayCells.forEach(cell => {
      cell.style.minHeight = '120px';
    });
  }
}

// Format a date for display
export function formatDate(date, format = 'long') {
  if (!date) return '';
  
  // Convert string dates to Date objects
  if (typeof date === 'string') {
    date = new Date(date);
  }
  
  // Format options
  const options = {
    long: {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    },
    short: {
      month: 'short',
      day: 'numeric'
    },
    time: {
      hour: '2-digit',
      minute: '2-digit'
    },
    dateTime: {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }
  };
  
  try {
    return date.toLocaleDateString('en-US', options[format]);
  } catch (error) {
    console.error('Error formatting date:', error);
    return String(date);
  }
}

// Generate a unique ID
export function generateId() {
  return 'id_' + Math.random().toString(36).substr(2, 9);
}

// Debounce function to limit how often a function can be called
export function debounce(func, wait = 300) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

// Safely get event data with defaults
export function getEventData(event) {
  return {
    id: event.id || generateId(),
    title: event.title || 'Untitled Event',
    description: event.extendedProps?.description || '',
    who: event.extendedProps?.who || '',
    when: event.extendedProps?.when || '',
    start: event.start || new Date(),
    end: event.end || event.start || new Date(),
    allDay: event.allDay !== undefined ? event.allDay : true
  };
}

// Validate event data
export function validateEvent(eventData) {
  if (!eventData.title || eventData.title.trim() === '') {
    return { valid: false, message: 'Event title is required' };
  }
  
  if (!eventData.start) {
    return { valid: false, message: 'Event start date is required' };
  }
  
  return { valid: true };
}

// Format the event for display in event list
export function formatEventListItem(event) {
  let html = `<div class="event-title">${event.title}</div>`;
  
  if (event.extendedProps.description) {
    html += `<div class="event-description">${event.extendedProps.description}</div>`;
  }
  
  if (event.extendedProps.who) {
    html += `<div class="event-who"><strong>Who:</strong> ${event.extendedProps.who}</div>`;
  }
  
  if (event.extendedProps.when) {
    html += `<div class="event-when"><strong>When:</strong> ${event.extendedProps.when}</div>`;
  }
  
  return html;
}

// Safe JSON parsing with error handling
export function safeJSONParse(str, fallback = {}) {
  try {
    return JSON.parse(str);
  } catch (e) {
    console.error('Error parsing JSON:', e);
    return fallback;
  }
}

// Group events by date for efficient rendering
export function groupEventsByDate(events) {
  const groupedEvents = {};
  
  events.forEach(event => {
    const dateStr = new Date(event.start).toISOString().split('T')[0];
    
    if (!groupedEvents[dateStr]) {
      groupedEvents[dateStr] = [];
    }
    
    groupedEvents[dateStr].push(event);
  });
  
  return groupedEvents;
}
