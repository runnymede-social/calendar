// Import other modules
import { setupStyles } from './styles.js';
import { createAllModals, showLoading, hideLoading, showToast, createOverlay, removeOverlay } from './ui-components.js';
import { showEventModal, showDayEventsModal, createEventPrompt, updateEventDots, editEvent, deleteEvent, saveNewEvent } from './event-handlers.js';
import { forceCalendarSize } from './utils.js';

document.addEventListener('DOMContentLoaded', function () {
  console.log('Calendar app initialization - ' + new Date().toISOString());
  
  // Add meta tag for viewport
  const metaTag = document.createElement('meta');
  metaTag.name = 'viewport';
  metaTag.content = 'width=device-width, initial-scale=1';
  document.head.appendChild(metaTag);
  
  const token = localStorage.getItem('calendarToken');
  if (!token) {
    window.location.href = 'index.html';
    return;
  }

  // Force FullCalendar to ignore screen size and always use full month view
  window.matchMedia = () => ({
    matches: false,
    addListener: () => {},
    removeListener: () => {}
  });

  const calendarEl = document.getElementById('calendar');
  let isMobile = window.innerWidth < 768;

  // Apply CSS styles
  setupStyles();

  // Add logout button
  const logoutContainer = document.createElement('div');
  logoutContainer.id = 'logoutContainer';
  
  logoutContainer.innerHTML = `
    <button id="logoutBtn">
      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
        <polyline points="16 17 21 12 16 7"></polyline>
        <line x1="21" y1="12" x2="9" y2="12"></line>
      </svg>
      <span id="logoutBtnText">Logout</span>
    </button>
  `;
  
  // Always add logout button to the top of the body for consistent positioning
  document.body.insertBefore(logoutContainer, document.body.firstChild);
  
  // Add logout functionality
  document.getElementById('logoutBtn').addEventListener('click', function() {
    if (confirm('Are you sure you want to log out?')) {
      localStorage.removeItem('calendarToken');
      window.location.href = 'index.html';
    }
  });

  // Create all modals (event, create, day events)
  const modals = createAllModals();

  // Add click handlers for non-modal elements in the document
  document.addEventListener('click', function(event) {
    // Handle clicks on calendar event elements
    if (!isMobile && (event.target.classList.contains('fc-event') || 
        event.target.closest('.fc-event'))) {
      // Don't handle it here, it will be handled by FullCalendar's eventClick
      return;
    }
    
    // Close event modal when clicking outside
    if (modals.eventModal.style.display === 'block' && !modals.eventModal.contains(event.target) &&
        !event.target.closest('.day-events-list li')) {
      modals.eventModal.style.display = 'none';
      removeOverlay();
    }
    
    // Close create event modal when clicking outside
    if (modals.createEventModal.style.display === 'block' && !modals.createEventModal.contains(event.target)) {
      modals.createEventModal.style.display = 'none';
      removeOverlay();
    }
    
    // Close day events modal when clicking outside
    if (modals.dayEventsModal.style.display === 'block' && !modals.dayEventsModal.contains(event.target) &&
        !event.target.closest('.fc-daygrid-day')) {
      modals.dayEventsModal.style.display = 'none';
      removeOverlay();
    }
  });

  // Initialize calendar
  const calendar = new FullCalendar.Calendar(calendarEl, {
    initialView: 'dayGridMonth',
    height: isMobile ? 'auto' : 800, // MUCH Larger height on desktop
    contentHeight: isMobile ? 600 : 800, // MUCH Larger height on desktop
    aspectRatio: isMobile ? 1.35 : 1.5, // Different aspect ratio for desktop
    expandRows: true,
    stickyHeaderDates: false, // Disable sticky headers for better sizing
    selectable: true,
    editable: false,
    eventDisplay: 'block',
    dayMaxEventRows: true,
    views: {
      dayGridMonth: {
        type: 'dayGridMonth',
        dayMaxEventRows: isMobile ? true : 5 // Show more events on desktop
      }
    },
    titleFormat: { year: 'numeric', month: 'long' },
    headerToolbar: {
      left: 'title',
      center: '',
      right: 'prev,next'
    },
    
    // Added callback for when dates change (like changing months)
    datesSet: function() {
      // This gets called whenever the calendar changes date/view
      if (isMobile) {
        // Update the event dots when month changes
        setTimeout(() => {
          updateEventDots(calendar, isMobile);
        }, 100); // Small delay to ensure DOM is updated
      }
    },
    
    // Make sure event elements have appropriate cursor
    eventDidMount: function(info) {
      info.el.style.cursor = 'pointer';
    },
    
    dateClick: function(info) {
      console.log('Date clicked:', info.dateStr, 'isMobile:', isMobile);
      
      if (isMobile) {
        console.log('MOBILE VIEW: Opening day events modal');
        showDayEventsModal(info.date, info.dateStr, calendar, isMobile, token);
      } else {
        console.log('DESKTOP VIEW: Opening create event modal directly');
        createEventPrompt(info.dateStr, calendar, token);
      }
    },

    eventClick: function(info) {
      console.log('Event clicked:', info.event.title);
      showEventModal(info.event, calendar, isMobile, token);
      // Prevent the default action
      info.jsEvent.preventDefault();
    }
  });
  
  // Add the calendar instance to window for global access
  window.calendarInstance = calendar;

  // Handle window resize to update mobile state
  window.addEventListener('resize', function() {
    const wasIsMobile = isMobile;
    isMobile = window.innerWidth < 768;
    
    console.log('Window resized, isMobile changed from', wasIsMobile, 'to', isMobile);
    
    // If mobile state changed, need to update the UI
    if (wasIsMobile !== isMobile) {
      // Reposition logout button
      const logoutContainer = document.getElementById('logoutContainer');
      if (logoutContainer) {
        if (isMobile) {
          // Move to top of calendar
          document.body.removeChild(logoutContainer);
          calendarEl.parentNode.insertBefore(logoutContainer, calendarEl);
        } else {
          // Move to top right of page
          calendarEl.parentNode.removeChild(logoutContainer);
          document.body.insertBefore(logoutContainer, document.body.firstChild);
        }
      }
      
      if (isMobile) {
        // Switched to mobile - add dots and adjust calendar size
        calendar.setOption('height', 'auto');
        calendar.setOption('contentHeight', 600);
        calendar.setOption('aspectRatio', 1.35);
        updateEventDots(calendar, isMobile);
      } else {
        // Switched to desktop - remove dots and increase calendar size
        calendar.setOption('height', 800);
        calendar.setOption('contentHeight', 800);
        calendar.setOption('aspectRatio', 1.5);
        const existingDots = document.querySelectorAll('.event-dot');
        existingDots.forEach(dot => dot.remove());
      }
      
      // Force redraw
      setTimeout(() => {
        calendar.updateSize();
      }, 10);
    }
    
    calendar.updateSize();
  });

  // Load events and render calendar
  (async () => {
    showLoading('Loading calendar events...');
    
    try {
      const res = await fetch('https://nzlrgp5k96.execute-api.us-east-1.amazonaws.com/dev/events', {
        headers: { Authorization: 'Bearer ' + token }
      });

      if (!res.ok) {
        throw new Error(`Failed to load events: ${res.status} ${res.statusText}`);
      }

      const events = await res.json();
      events.forEach(ev => {
        calendar.addEvent({
          id: ev.id,
          title: ev.title,
          start: ev.time,
          allDay: true,
          extendedProps: { 
            description: ev.description || '',
            who: ev.who || '',
            when: ev.when || '' 
          }
        });
      });

      calendar.render();
      
      // Apply force sizing after render
      forceCalendarSize(calendarEl, isMobile);
      
      // After the calendar is rendered, add dots to days with events
      setTimeout(() => {
        updateEventDots(calendar, isMobile);
        hideLoading();
        
        // Force resize one more time after a delay
        forceCalendarSize(calendarEl, isMobile);
      }, 100);
      
      // Make sure all event elements have cursor: pointer style
      document.querySelectorAll('.fc-event').forEach(el => {
        el.style.cursor = 'pointer';
      });
      
      // Add important messages section
      const messagesContainer = document.createElement('div');
      messagesContainer.id = 'calendar-messages';
      messagesContainer.innerHTML = `
        <h3>Important Messages</h3>
        <div id="messages-list">
          <div class="message-item message-priority-high">
            <span class="message-date">Apr 22</span>
            <span class="message-text">Choir practice will be held at the Community Center today instead of the usual location.</span>
          </div>
          <div class="message-item message-priority-medium">
            <span class="message-date">Apr 25</span>
            <span class="message-text">Remember to bring your music sheets for the weekend rehearsal.</span>
          </div>
        </div>
      `;
      
      // Add it after the calendar
      calendarEl.parentNode.insertBefore(messagesContainer, calendarEl.nextSibling);
      
    } catch (err) {
      hideLoading();
      const errorEl = document.getElementById('error');
      if (errorEl) {
        errorEl.innerText = 'Error loading events: ' + err.message;
      } else {
        showToast('Error loading events: ' + err.message, 'error');
        console.error('Error loading events:', err.message);
      }
    }
  })();
  
  // Apply one final resize after everything else has loaded
  window.addEventListener('load', function() {
    setTimeout(() => forceCalendarSize(calendarEl, isMobile), 200);
  });
});
