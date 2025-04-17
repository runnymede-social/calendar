document.addEventListener('DOMContentLoaded', function () {
  const token = localStorage.getItem('calendarToken');
  if (!token) {
    window.location.href = 'index.html';
    return;
  }

  // 🔒 Force FullCalendar to ignore screen size and always use full month view
  window.matchMedia = () => ({
    matches: false,
    addListener: () => {},
    removeListener: () => {}
  });

  const calendarEl = document.getElementById('calendar');
  const isMobile = window.innerWidth < 768;

  // Add mobile-specific styles for the calendar
  const style = document.createElement('style');
  style.textContent = `
    @media (max-width: 768px) {
      .fc-view-harness {
        min-height: 500px !important;
      }
      .fc-toolbar {
        flex-direction: column;
        gap: 10px;
      }
      .fc-toolbar-chunk {
        display: flex;
        justify-content: center;
      }
      .fc-col-header-cell-cushion,
      .fc-daygrid-day-number {
        font-size: 0.9rem;
      }
      .fc-daygrid-day-events {
        min-height: 20px;
      }
      /* Hide event text on mobile, just show dots */
      .fc-daygrid-event-harness {
        display: none !important;
      }
      /* Show colored dots for days with events */
      .has-events:after {
        content: '';
        display: block;
        width: 8px;
        height: 8px;
        background-color: #3498db;
        border-radius: 50%;
        position: absolute;
        bottom: 4px;
        left: 50%;
        transform: translateX(-50%);
      }
      .fc-daygrid-day-top {
        justify-content: center !important;
      }
      .fc-daygrid-day-number {
        float: none !important;
        padding-right: 0 !important;
      }
      #eventModal {
        width: 90% !important;
        max-width: 350px;
      }
      #calendar {
        width: 100% !important;
        height: auto !important;
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

  // 🛠️ SAFELY ATTACH MODAL TO BODY
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
  
  const dayModalTitleEl = document.getElementById('dayModalTitle');
  const dayEventsListEl = document.getElementById('dayEventsList');
  const addEventBtn = document.getElementById('addEventBtn');
  const closeDayModalBtn = document.getElementById('closeDayModalBtn');
  
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

  const modalTitleEl = document.getElementById('modalTitle');
  const modalDescEl = document.getElementById('modalDesc');
  const editBtn = document.getElementById('editBtn');
  const deleteBtn = document.getElementById('deleteBtn');
  const closeBtn = document.getElementById('closeBtn');

  // Close modals when clicking outside
  document.addEventListener('click', function (event) {
    // Close event modal
    if (modal.style.display === 'block' && !modal.contains(event.target) &&
      event.target.className !== 'fc-event-title' &&
      !event.target.closest('.fc-event') &&
      !event.target.closest('.day-events-list li')) {
      modal.style.display = 'none';
      const overlay = document.getElementById('modalOverlay');
      if (overlay) {
        document.body.removeChild(overlay);
      }
    }
    
    // Close day events modal
    if (dayEventsModal.style.display === 'block' && !dayEventsModal.contains(event.target) &&
      !event.target.closest('.fc-daygrid-day')) {
      dayEventsModal.style.display = 'none';
      const overlay = document.getElementById('modalOverlay');
      if (overlay) {
        document.body.removeChild(overlay);
      }
    }
  });

  // Function to create overlay
  function createOverlay() {
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
  
  // Function to remove overlay
  function removeOverlay() {
    const overlay = document.getElementById('modalOverlay');
    if (overlay) {
      document.body.removeChild(overlay);
    }
  }

  const calendar = new FullCalendar.Calendar(calendarEl, {
    initialView: 'dayGridMonth',
    height: 'auto',
    contentHeight: 600, // Ensures minimum height
    aspectRatio: 1.35,  // Controls width-to-height ratio
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
    dayCellClassNames: () => ['custom-day-cell'],
    headerToolbar: {
      left: 'title',
      center: '',
      right: 'prev,next'
    },
    
    // Add dots to days with events
    dayCellDidMount: function(info) {
      // Only do this on mobile
      if (isMobile) {
        // Check if the day has events
        const dayEvents = calendar.getEvents().filter(event => {
          const eventStart = new Date(event.start);
          return eventStart.toDateString() === info.date.toDateString();
        });
        
        if (dayEvents.length > 0) {
          info.el.classList.add('has-events');
        }
      }
    },

    dateClick: async function (info) {
      if (isMobile) {
        // On mobile, show day events modal instead of creating event directly
        const clickedDate = info.date;
        const dateStr = clickedDate.toLocaleDateString('en-US', { 
          weekday: 'long', 
          month: 'long', 
          day: 'numeric' 
        });
        
        dayModalTitleEl.textContent = dateStr;
        
        // Get events for this day
        const dayEvents = calendar.getEvents().filter(event => {
          const eventStart = new Date(event.start);
          return eventStart.toDateString() === clickedDate.toDateString();
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
              createOverlay();
              modalTitleEl.textContent = event.title;
              modalDescEl.textContent = event.extendedProps.description || '(No description)';
              modal.style.display = 'block';
              
              // Set up edit and delete handlers for this event
              setupEventModalHandlers(event);
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
          // Hide day events modal
          dayEventsModal.style.display = 'none';
          removeOverlay();
          
          // Show prompt to create event
          createEventPrompt(info.dateStr);
        };
        
        // Set up close button
        closeDayModalBtn.onclick = () => {
          dayEventsModal.style.display = 'none';
          removeOverlay();
        };
        
        // Show day events modal
        createOverlay();
        dayEventsModal.style.display = 'block';
      } else {
        // On desktop, use original behavior - prompt for new event
        createEventPrompt(info.dateStr);
      }
    },

    eventClick: function (info) {
      const event = info.event;

      if (!modalTitleEl || !modalDescEl) {
        console.error('❌ Modal elements not found!');
        return;
      }

      createOverlay();
      modalTitleEl.textContent = event.title;
      modalDescEl.textContent = event.extendedProps.description || '(No description)';
      modal.style.display = 'block';
      
      setupEventModalHandlers(event);
    }
  });
  
  // Function to set up event modal handlers
  function setupEventModalHandlers(event) {
    editBtn.onclick = async () => {
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
        
        // Refresh calendar to update dots if on mobile
        if (isMobile) {
          calendar.render();
        }
      } catch (err) {
        alert('Update error: ' + err.message);
      }
    };

    deleteBtn.onclick = async () => {
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
          
          // Refresh calendar to update dots if on mobile
          if (isMobile) {
            calendar.render();
          }
        } catch (err) {
          alert('Delete error: ' + err.message);
        }
      }
    };

    closeBtn.onclick = () => {
      modal.style.display = 'none';
      removeOverlay();
    };
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
      
      // Refresh calendar to update dots if on mobile
      if (isMobile) {
        calendar.render();
      }
    } catch (err) {
      alert('Create error: ' + err.message);
    }
  }

  // Handle window resize to force calendar redraw and update mobile state
  window.addEventListener('resize', function() {
    const wasIsMobile = isMobile;
    isMobile = window.innerWidth < 768;
    
    // If mobile state changed, need to re-render
    if (wasIsMobile !== isMobile) {
      calendar.render();
    }
    
    calendar.updateSize();
  });

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
      
      // Force an update after a slight delay to ensure proper rendering
      setTimeout(() => {
        calendar.updateSize();
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
