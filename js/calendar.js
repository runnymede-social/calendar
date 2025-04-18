document.addEventListener('DOMContentLoaded', function () {
  console.log('Calendar with dots loaded - FINAL VERSION - ' + new Date().toISOString());
  
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

  // Add style for event dots and mobile-specific styles
  const style = document.createElement('style');
  style.textContent = `
    /* Mobile specific styles */
    @media (max-width: 768px) {
      .fc-daygrid-event {
        display: none !important;
      }
      .fc-daygrid-day-top {
        justify-content: center !important;
      }
      .fc-daygrid-day-number {
        float: none !important;
      }
      .event-dot {
        width: 8px;
        height: 8px;
        background-color: #3498db;
        border-radius: 50%;
        margin: 4px auto;
        display: block;
      }
      #calendar .fc-daygrid-body {
        width: 100% !important;
      }
      #eventModal, #dayEventsModal {
        width: 90% !important;
        max-width: 350px;
      }
      .day-events-list {
        margin-top: 10px;
        padding-left: 0;
      }
      .day-events-list li {
        background: #f5f7fa;
        margin-bottom: 5px;
        padding: 8px;
        border-radius: 4px;
        list-style-type: none;
        border-left: 3px solid #3498db;
      }
      .day-events-list li .event-title {
        font-weight: bold;
      }
      .day-events-list li .event-description {
        font-size: 0.85rem;
        color: #666;
        margin-top: 3px;
      }
    }
  `;
  document.head.appendChild(style);

  // Create modal for showing event details
  const modal = document.createElement('div');
  modal.id = 'eventModal';
  modal.style.display = 'none';
  modal.style.position = 'fixed';
  modal.style.zIndex = '1000';
  modal.style.top = '50%';
  modal.style.left = '50%';
  modal.style.transform = 'translate(-50%, -50%)';
  modal.style.background = '#fff';
  modal.style.padding = '1rem';
  modal.style.border = '1px solid #ccc';
  modal.style.borderRadius = '8px';
  modal.style.boxShadow = '0 4px 20px rgba(0,0,0,0.3)';
  modal.style.minWidth = '300px';
  
  // Create day events modal for mobile
  const dayEventsModal = document.createElement('div');
  dayEventsModal.id = 'dayEventsModal';
  dayEventsModal.style.display = 'none';
  dayEventsModal.style.position = 'fixed';
  dayEventsModal.style.zIndex = '1000';
  dayEventsModal.style.top = '50%';
  dayEventsModal.style.left = '50%';
  dayEventsModal.style.transform = 'translate(-50%, -50%)';
  dayEventsModal.style.background = '#fff';
  dayEventsModal.style.padding = '1rem';
  dayEventsModal.style.border = '1px solid #ccc';
  dayEventsModal.style.borderRadius = '8px';
  dayEventsModal.style.boxShadow = '0 4px 20px rgba(0,0,0,0.3)';
  dayEventsModal.style.width = '90%';
  dayEventsModal.style.maxWidth = '350px';
  dayEventsModal.style.maxHeight = '80vh';
  dayEventsModal.style.overflow = 'auto';
  
  dayEventsModal.innerHTML = `
    <h3 id="dayModalTitle"></h3>
    <ul class="day-events-list" id="dayEventsList"></ul>
    <div style="display: flex; justify-content: space-between; margin-top: 15px;">
      <button id="addEventBtn">Add Event</button>
      <button id="closeDayModalBtn">Close</button>
    </div>
  `;
  
  document.body.appendChild(dayEventsModal);
  
  // Regular event modal content
  modal.innerHTML = `
    <h3 id="modalTitle"></h3>
    <p id="modalDesc"></p>
    <div style="display: flex; justify-content: space-between; margin-top: 15px;">
      <button id="editBtn">Edit</button>
      <button id="deleteBtn" style="background-color: #ff4d4d; color: white;">Delete</button>
      <button id="closeBtn">Close</button>
    </div>
  `;

  document.body.appendChild(modal);

  // Get references to modal elements
  const modalTitleEl = document.getElementById('modalTitle');
  const modalDescEl = document.getElementById('modalDesc');
  const editBtn = document.getElementById('editBtn');
  const deleteBtn = document.getElementById('deleteBtn');
  const closeBtn = document.getElementById('closeBtn');
  
  const dayModalTitleEl = document.getElementById('dayModalTitle');
  const dayEventsListEl = document.getElementById('dayEventsList');
  const addEventBtn = document.getElementById('addEventBtn');
  const closeDayModalBtn = document.getElementById('closeDayModalBtn');

  // Close modals when clicking outside
  document.addEventListener('click', function (event) {
    // Close event modal
    if (modal.style.display === 'block' && !modal.contains(event.target) &&
        !event.target.closest('.day-events-list li')) {
      modal.style.display = 'none';
      removeOverlay();
    }
    
    // Close day events modal
    if (dayEventsModal.style.display === 'block' && !dayEventsModal.contains(event.target) &&
        !event.target.closest('.fc-daygrid-day')) {
      dayEventsModal.style.display = 'none';
      removeOverlay();
    }
  });

  // Helper functions for overlay
  function createOverlay() {
    const existingOverlay = document.getElementById('modalOverlay');
    if (existingOverlay) {
      return existingOverlay;
    }
    
    const overlay = document.createElement('div');
    overlay.id = 'modalOverlay';
    overlay.style.position = 'fixed';
    overlay.style.top = '0';
    overlay.style.left = '0';
    overlay.style.width = '100%';
    overlay.style.height = '100%';
    overlay.style.backgroundColor = 'rgba(0,0,0,0.5)';
    overlay.style.zIndex = '999';
    document.body.appendChild(overlay);
    return overlay;
  }
  
  function removeOverlay() {
    const overlay = document.getElementById('modalOverlay');
    if (overlay) {
      document.body.removeChild(overlay);
    }
  }

  // Initialize calendar
  const calendar = new FullCalendar.Calendar(calendarEl, {
    initialView: 'dayGridMonth',
    height: 'auto',
    contentHeight: 600,
    aspectRatio: 1.35,
    expandRows: true,
    selectable: true,
    editable: false,
    eventDisplay: 'block',
    dayMaxEventRows: true,
    views: {
      dayGridMonth: {
        type: 'dayGridMonth',
        dayMaxEventRows: true
      }
    },
    titleFormat: { year: 'numeric', month: 'long' },
    headerToolbar: {
      left: 'title',
      center: '',
      right: 'prev,next'
    },
    
    dateClick: function(info) {
      if (isMobile) {
        showDayEventsModal(info.date, info.dateStr);
      } else {
        createEventPrompt(info.dateStr);
      }
    },

    eventClick: function(info) {
      const event = info.event;
      showEventModal(event);
    }
  });

  // Function to show event modal
  function showEventModal(event) {
    if (!modalTitleEl || !modalDescEl) {
      console.error('❌ Modal elements not found!');
      return;
    }

    createOverlay();
    modalTitleEl.textContent = event.title;
    modalDescEl.textContent = event.extendedProps.description || '(No description)';
    modal.style.display = 'block';
    
    // Set up event handlers
    editBtn.onclick = () => editEvent(event);
    deleteBtn.onclick = () => deleteEvent(event);
    closeBtn.onclick = () => {
      modal.style.display = 'none';
      removeOverlay();
    };
  }
  
  // Function to show day events modal
  function showDayEventsModal(date, dateStr) {
    const formattedDate = date.toLocaleDateString('en-US', { 
      weekday: 'long', 
      month: 'long', 
      day: 'numeric' 
    });
    
    dayModalTitleEl.textContent = formattedDate;
    
    // Get events for this day
    const dayEvents = calendar.getEvents().filter(event => {
      const eventStart = new Date(event.start);
      return eventStart.toDateString() === date.toDateString();
    });
    
    // Clear existing list
    dayEventsListEl.innerHTML = '';
    
    // Add events to list
    if (dayEvents.length > 0) {
      dayEvents.forEach(event => {
        const li = document.createElement('li');
        li.innerHTML = `
          <div class="event-title">${event.title}</div>
          <div class="event-description">${event.extendedProps.description || '(No description)'}</div>
        `;
        
        // Add click handler to open event details
        li.addEventListener('click', function() {
          // Hide day events modal
          dayEventsModal.style.display = 'none';
          
          // Show event modal
          showEventModal(event);
        });
        
        dayEventsListEl.appendChild(li);
      });
    } else {
      const li = document.createElement('li');
      li.textContent = 'No events for this day';
      dayEventsListEl.appendChild(li);
    }
    
    // Set up add event button
    addEventBtn.onclick = () => {
      dayEventsModal.style.display = 'none';
      removeOverlay();
      createEventPrompt(dateStr);
    };
    
    // Set up close button
    closeDayModalBtn.onclick = () => {
      dayEventsModal.style.display = 'none';
      removeOverlay();
    };
    
    // Show modal
    createOverlay();
    dayEventsModal.style.display = 'block';
  }
  
  // Function to edit an event
  async function editEvent(event) {
    modal.style.display = 'none';
    removeOverlay();
    
    const newTitle = prompt('Edit title:', event.title);
    if (newTitle === null) return;
    const newDesc = prompt('Edit description:', event.extendedProps.description || '');

    try {
      const res = await fetch('https://nzlrgp5k96.execute-api.us-east-1.amazonaws.com/dev/events', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer ' + token
        },
        body: JSON.stringify({ id: event.id, title: newTitle, description: newDesc })
      });

      if (!res.ok) throw new Error('Failed to update');
      event.setProp('title', newTitle);
      event.setExtendedProp('description', newDesc);
      
      // Update the dots for mobile view
      if (isMobile) {
        updateEventDots();
      }
    } catch (err) {
      alert('Update error: ' + err.message);
    }
  }
  
  // Function to delete an event
  async function deleteEvent(event) {
    if (confirm('Are you sure you want to delete this event?')) {
      try {
        const res = await fetch('https://nzlrgp5k96.execute-api.us-east-1.amazonaws.com/dev/events', {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
            Authorization: 'Bearer ' + token
          },
          body: JSON.stringify({ id: event.id })
        });

        if (!res.ok) throw new Error('Failed to delete event');
        
        // Remove event from calendar
        event.remove();
        
        // Close modal
        modal.style.display = 'none';
        removeOverlay();
        
        // Update the dots for mobile view
        if (isMobile) {
          updateEventDots();
        }
      } catch (err) {
        alert('Delete error: ' + err.message);
      }
    }
  }

  // Function to prompt for new event creation
  async function createEventPrompt(dateStr) {
    const title = prompt('Enter event title:');
    if (!title) return;
    const description = prompt('Enter event description (optional):') || '';

    try {
      const res = await fetch('https://nzlrgp5k96.execute-api.us-east-1.amazonaws.com/dev/events', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer ' + token
        },
        body: JSON.stringify({ title, description, time: dateStr })
      });

      const data = await res.json();
      if (!res.ok || !data.id) throw new Error('Failed to create event');

      calendar.addEvent({
        id: data.id,
        title,
        start: dateStr,
        allDay: true,
        extendedProps: { description }
      });
      
      // Update the dots for mobile view
      if (isMobile) {
        updateEventDots();
      }
    } catch (err) {
      alert('Create error: ' + err.message);
    }
  }
  
  // Function to add dots to days with events
  function updateEventDots() {
    if (!isMobile) return;
    
    // First, remove any existing dots
    const existingDots = document.querySelectorAll('.event-dot');
    existingDots.forEach(dot => dot.remove());
    
    // Create a map of dates that have events
    const eventDates = {};
    calendar.getEvents().forEach(event => {
      // Format date as YYYY-MM-DD for comparison
      const dateStr = new Date(event.start).toISOString().split('T')[0];
      eventDates[dateStr] = true;
    });
    
    // Add dots to each day that has events
    document.querySelectorAll('.fc-daygrid-day').forEach(dayEl => {
      const dateAttr = dayEl.getAttribute('data-date');
      if (eventDates[dateAttr]) {
        // Add a dot to this day cell
        const dayCell = dayEl.querySelector('.fc-daygrid-day-bottom');
        if (dayCell) {
          const dot = document.createElement('div');
          dot.className = 'event-dot';
          dayCell.appendChild(dot);
        }
      }
    });
  }

  // Handle window resize to update mobile state
  window.addEventListener('resize', function() {
    const wasIsMobile = isMobile;
    isMobile = window.innerWidth < 768;
    
    // If mobile state changed, need to update the UI
    if (wasIsMobile !== isMobile) {
      if (isMobile) {
        // Switched to mobile - add dots
        updateEventDots();
      } else {
        // Switched to desktop - remove dots
        const existingDots = document.querySelectorAll('.event-dot');
        existingDots.forEach(dot => dot.remove());
      }
    }
    
    calendar.updateSize();
  });

  // Load events and render calendar
  (async () => {
    try {
      const res = await fetch('https://nzlrgp5k96.execute-api.us-east-1.amazonaws.com/dev/events', {
        headers: { Authorization: 'Bearer ' + token }
      });

      const events = await res.json();
      events.forEach(ev => {
        calendar.addEvent({
          id: ev.id,
          title: ev.title,
          start: ev.time,
          allDay: true,
          extendedProps: { description: ev.description || '' }
        });
      });

      calendar.render();
      
      // After the calendar is rendered, add dots to days with events
      setTimeout(() => {
        updateEventDots();
      }, 100);
    } catch (err) {
      const errorEl = document.getElementById('error');
      if (errorEl) {
        errorEl.innerText = 'Error loading events: ' + err.message;
      } else {
        console.error('Error loading events:', err.message);
      }
    }
  })();
});
