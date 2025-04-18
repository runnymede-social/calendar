document.addEventListener('DOMContentLoaded', function () {
  console.log('Calendar with no zoom on input - ' + new Date().toISOString());
  
  // Add meta tag to prevent zooming on inputs
  const metaTag = document.createElement('meta');
  metaTag.name = 'viewport';
  metaTag.content = 'width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no';
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

  // First, apply extra CSS styles including logout button styling
  const forceDesktopStyles = document.createElement('style');
  forceDesktopStyles.textContent = `
    /* Prevent zooming and text size adjustment */
    input, textarea, select, button {
      font-size: 16px !important; /* Prevents iOS zoom on focus */
    }
    
    /* Logout button styles */
    #logoutContainer {
      position: absolute;
      right: 15px;
      z-index: 100;
    }
    
    #logoutBtn {
      background-color: #f2f2f2;
      color: #333;
      border: none;
      padding: 8px 15px;
      border-radius: 4px;
      cursor: pointer;
      font-size: 14px;
      display: flex;
      align-items: center;
      transition: background-color 0.2s;
    }
    
    #logoutBtn:hover {
      background-color: #e6e6e6;
    }
    
    #logoutBtn svg {
      margin-right: 5px;
    }
    
    /* Mobile specific logout button */
    @media (max-width: 768px) {
      #logoutContainer {
        position: absolute;
        text-align: right;
        margin-bottom: 10px;
        right: 15px;
        top: 10px;
        z-index: 100;
      }
      
      #logoutBtn {
        font-size: 12px;
        padding: 6px 10px;
      }
      
      /* Hide text on very small screens */
      @media (max-width: 400px) {
        #logoutBtnText {
          display: none;
        }
        
        #logoutBtn svg {
          margin-right: 0;
        }
      }
    }
    
    /* Button styles */
    #deleteBtn {
      background-color: #ff4d4d !important; 
      color: white !important;
      border: none !important;
      padding: 8px 12px !important;
      border-radius: 4px !important;
      cursor: pointer !important;
    }
    
    #deleteBtn:hover {
      background-color: #ff3333 !important;
    }
    
    /* IMPORTANT: Ensure desktop styles are applied strongly */
    @media (min-width: 769px) {
      #calendar {
        min-height: 800px !important;
        height: 800px !important;
        max-width: 1200px !important;
        margin: 0 auto !important;
      }
      
      .fc-view-harness {
        min-height: 700px !important;
      }
      
      .fc .fc-daygrid-day {
        min-height: 120px !important;
        height: 120px !important;
      }
      
      .fc-daygrid-day-frame {
        min-height: 120px !important;
      }
      
      /* Force larger calendar on desktop */
      .fc-view-harness, .fc-view-harness-active, .fc-daygrid {
        height: auto !important;
        min-height: 700px !important;
      }
      
      .fc-scrollgrid, .fc-scrollgrid-liquid {
        height: 100% !important;
      }
      
      .fc-scroller {
        overflow: visible !important;
        height: auto !important;
      }
    }
    
    /* Loading indicator styles */
    .loading-overlay {
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background-color: rgba(255,255,255,0.7);
      z-index: 2000;
      display: flex;
      justify-content: center;
      align-items: center;
      flex-direction: column;
    }
    
    .loading-spinner {
      width: 50px;
      height: 50px;
      border: 5px solid #f3f3f3;
      border-top: 5px solid #3498db;
      border-radius: 50%;
      animation: spin 1s linear infinite;
      margin-bottom: 15px;
    }
    
    .loading-text {
      font-size: 18px;
      color: #333;
    }
    
    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
    
    /* Toast notification */
    .toast {
      position: fixed;
      bottom: 20px;
      left: 50%;
      transform: translateX(-50%);
      background-color: #333;
      color: white;
      padding: 12px 24px;
      border-radius: 4px;
      font-size: 16px;
      z-index: 2000;
      opacity: 0;
      transition: opacity 0.3s ease-in-out;
    }
    
    .toast.show {
      opacity: 1;
    }
    
    .toast.success {
      background-color: #4CAF50;
    }
    
    .toast.error {
      background-color: #f44336;
    }
    
    /* Mobile specific styles */
    @media (max-width: 768px) {
      #calendar {
        height: auto !important;
      }
      
      .fc-daygrid-day {
        min-height: initial;
      }
      
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
  document.head.appendChild(forceDesktopStyles);

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
  
  // Create event creation modal
  const createEventModal = document.createElement('div');
  createEventModal.id = 'createEventModal';
  createEventModal.style.display = 'none';
  createEventModal.style.position = 'fixed';
  createEventModal.style.zIndex = '1000';
  createEventModal.style.top = '50%';
  createEventModal.style.left = '50%';
  createEventModal.style.transform = 'translate(-50%, -50%)';
  createEventModal.style.background = '#fff';
  createEventModal.style.padding = '1rem';
  createEventModal.style.border = '1px solid #ccc';
  createEventModal.style.borderRadius = '8px';
  createEventModal.style.boxShadow = '0 4px 20px rgba(0,0,0,0.3)';
  createEventModal.style.minWidth = '300px';
  createEventModal.style.maxWidth = '90%';
  
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
      <button id="deleteBtn">Delete</button>
      <button id="closeBtn">Close</button>
    </div>
  `;

  // Create event modal content
  createEventModal.innerHTML = `
    <h3>Create New Event</h3>
    <div style="margin: 15px 0;">
      <label for="newEventTitle" style="display: block; margin-bottom: 5px; font-weight: bold;">Event Title:</label>
      <input type="text" id="newEventTitle" style="width: 100%; padding: 8px; border: 1px solid #ccc; border-radius: 4px; font-size: 16px; box-sizing: border-box;">
    </div>
    <div style="margin: 15px 0;">
      <label for="newEventDesc" style="display: block; margin-bottom: 5px; font-weight: bold;">Description:</label>
      <textarea id="newEventDesc" style="width: 100%; padding: 8px; border: 1px solid #ccc; border-radius: 4px; font-size: 16px; box-sizing: border-box; min-height: 80px;"></textarea>
    </div>
    <div style="display: flex; justify-content: space-between; margin-top: 15px;">
      <button id="saveNewEventBtn" style="background-color: #4CAF50; color: white; border: none; padding: 8px 12px; border-radius: 4px; cursor: pointer;">Save</button>
      <button id="cancelNewEventBtn" style="background-color: #f2f2f2; color: #333; border: none; padding: 8px 12px; border-radius: 4px; cursor: pointer;">Cancel</button>
    </div>
  `;

  document.body.appendChild(modal);
  document.body.appendChild(createEventModal);

  // Get references to modal elements
  const modalTitleEl = document.getElementById('modalTitle');
  const modalDescEl = document.getElementById('modalDesc');
  const editBtn = document.getElementById('editBtn');
  const deleteBtn = document.getElementById('deleteBtn');
  const closeBtn = document.getElementById('closeBtn');
  
  // Get references to create event modal elements
  const newEventTitleInput = document.getElementById('newEventTitle');
  const newEventDescInput = document.getElementById('newEventDesc');
  const saveNewEventBtn = document.getElementById('saveNewEventBtn');
  const cancelNewEventBtn = document.getElementById('cancelNewEventBtn');
  
  const dayModalTitleEl = document.getElementById('dayModalTitle');
  const dayEventsListEl = document.getElementById('dayEventsList');
  const addEventBtn = document.getElementById('addEventBtn');
  const closeDayModalBtn = document.getElementById('closeDayModalBtn');

  // Add click handlers for non-modal elements in the document
  document.addEventListener('click', function(event) {
    // Handle clicks on calendar event elements
    if (!isMobile && (event.target.classList.contains('fc-event') || 
        event.target.closest('.fc-event'))) {
      // Don't handle it here, it will be handled by FullCalendar's eventClick
      return;
    }
    
    // Close event modal when clicking outside
    if (modal.style.display === 'block' && !modal.contains(event.target) &&
        !event.target.closest('.day-events-list li')) {
      modal.style.display = 'none';
      removeOverlay();
    }
    
    // Close create event modal when clicking outside
    if (createEventModal.style.display === 'block' && !createEventModal.contains(event.target)) {
      createEventModal.style.display = 'none';
      removeOverlay();
    }
    
    // Close day events modal when clicking outside
    if (dayEventsModal.style.display === 'block' && !dayEventsModal.contains(event.target) &&
        !event.target.closest('.fc-daygrid-day')) {
      dayEventsModal.style.display = 'none';
      removeOverlay();
    }
  });

  // Prevent zoom on inputs
  function preventZoom(e) {
    const t2 = e.timeStamp;
    const t1 = e.currentTarget.dataset.lastTouch || t2;
    const dt = t2 - t1;
    const fingers = e.touches.length;
    
    e.currentTarget.dataset.lastTouch = t2;
    
    if (!dt || dt > 500 || fingers > 1) return; // Not double-tap
    
    e.preventDefault();
    e.target.click();
  }
  
  // Apply the zoom prevention to all inputs and textareas
  document.addEventListener('DOMContentLoaded', function() {
    const fields = document.querySelectorAll('input, textarea');
    for (let i = 0; i < fields.length; i++) {
      fields[i].addEventListener('touchend', preventZoom, false);
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
  
  // Loading indicator functions
  function showLoading(message = 'Loading...') {
    const existingLoader = document.getElementById('loadingOverlay');
    if (existingLoader) {
      document.getElementById('loadingText').textContent = message;
      return;
    }
    
    const loadingOverlay = document.createElement('div');
    loadingOverlay.id = 'loadingOverlay';
    loadingOverlay.className = 'loading-overlay';
    
    loadingOverlay.innerHTML = `
      <div class="loading-spinner"></div>
      <div class="loading-text" id="loadingText">${message}</div>
    `;
    
    document.body.appendChild(loadingOverlay);
  }
  
  function hideLoading() {
    const loadingOverlay = document.getElementById('loadingOverlay');
    if (loadingOverlay) {
      document.body.removeChild(loadingOverlay);
    }
  }
  
  // Toast notification functions
  function showToast(message, type = '', duration = 3000) {
    // Remove any existing toast
    const existingToast = document.querySelector('.toast');
    if (existingToast) {
      document.body.removeChild(existingToast);
    }
    
    const toast = document.createElement('div');
    toast.className = 'toast ' + type;
    toast.textContent = message;
    
    document.body.appendChild(toast);
    
    // Force reflow to enable animation
    void toast.offsetWidth;
    
    toast.classList.add('show');
    
    setTimeout(() => {
      toast.classList.remove('show');
      setTimeout(() => {
        if (toast.parentNode) {
          document.body.removeChild(toast);
        }
      }, 300);
    }, duration);
  }

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
          updateEventDots();
        }, 100); // Small delay to ensure DOM is updated
      }
    },
    
    // Make sure event elements have appropriate cursor
    eventDidMount: function(info) {
      info.el.style.cursor = 'pointer';
    },
    
    dateClick: function(info) {
      if (isMobile) {
        showDayEventsModal(info.date, info.dateStr);
      } else {
        createEventPrompt(info.dateStr);
      }
    },

    eventClick: function(info) {
      console.log('Event clicked:', info.event.title);
      showEventModal(info.event);
      // Prevent the default action
      info.jsEvent.preventDefault();
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
    
    // Create a temporary modal for editing
    const editModal = document.createElement('div');
    editModal.id = 'editEventModal';
    editModal.style.display = 'block';
    editModal.style.position = 'fixed';
    editModal.style.zIndex = '1000';
    editModal.style.top = '50%';
    editModal.style.left = '50%';
    editModal.style.transform = 'translate(-50%, -50%)';
    editModal.style.background = '#fff';
    editModal.style.padding = '1rem';
    editModal.style.border = '1px solid #ccc';
    editModal.style.borderRadius = '8px';
    editModal.style.boxShadow = '0 4px 20px rgba(0,0,0,0.3)';
    editModal.style.minWidth = '300px';
    editModal.style.maxWidth = '90%';
    
    editModal.innerHTML = `
      <h3>Edit Event</h3>
      <div style="margin: 15px 0;">
        <label for="editEventTitle" style="display: block; margin-bottom: 5px; font-weight: bold;">Event Title:</label>
        <input type="text" id="editEventTitle" value="${event.title}" style="width: 100%; padding: 8px; border: 1px solid #ccc; border-radius: 4px; font-size: 16px; box-sizing: border-box;">
      </div>
      <div style="margin: 15px 0;">
        <label for="editEventDesc" style="display: block; margin-bottom: 5px; font-weight: bold;">Description:</label>
        <textarea id="editEventDesc" style="width: 100%; padding: 8px; border: 1px solid #ccc; border-radius: 4px; font-size: 16px; box-sizing: border-box; min-height: 80px;">${event.extendedProps.description || ''}</textarea>
      </div>
      <div style="display: flex; justify-content: space-between; margin-top: 15px;">
        <button id="saveEditBtn" style="background-color: #4CAF50; color: white; border: none; padding: 8px 12px; border-radius: 4px; cursor: pointer;">Save</button>
        <button id="cancelEditBtn" style="background-color: #f2f2f2; color: #333; border: none; padding: 8px 12px; border-radius: 4px; cursor: pointer;">Cancel</button>
      </div>
    `;
    
    document.body.appendChild(editModal);
    createOverlay();
    
    // Get references to edit modal elements
    const editTitleInput = document.getElementById('editEventTitle');
    const editDescInput = document.getElementById('editEventDesc');
    const saveEditBtn = document.getElementById('saveEditBtn');
    const cancelEditBtn = document.getElementById('cancelEditBtn');
    
    // Focus on title
    setTimeout(() => editTitleInput.focus(), 100);
    
    // Set up button handlers
    saveEditBtn.onclick = async function() {
      const newTitle = editTitleInput.value.trim();
      if (!newTitle) {
        showToast('Please enter an event title', 'error');
        return;
      }
      
      const newDesc = editDescInput.value.trim();
      
      // Remove the temporary modal
      editModal.style.display = 'none';
      document.body.removeChild(editModal);
      
      showLoading('Updating event...');
      
      try {
        const res = await fetch('https://nzlrgp5k96.execute-api.us-east-1.amazonaws.com/dev/events', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: 'Bearer ' + token
          },
          body: JSON.stringify({ id: event.id, title: newTitle, description: newDesc })
        });

        hideLoading();
        removeOverlay();
        
        if (!res.ok) throw new Error('Failed to update');
        event.setProp('title', newTitle);
        event.setExtendedProp('description', newDesc);
        
        // Update the dots for mobile view
        if (isMobile) {
          updateEventDots();
        }
        
        showToast('Event updated successfully!', 'success');
      } catch (err) {
        hideLoading();
        removeOverlay();
        showToast('Update error: ' + err.message, 'error');
      }
    };
    
    cancelEditBtn.onclick = function() {
      editModal.style.display = 'none';
      document.body.removeChild(editModal);
      removeOverlay();
    };
    
    // Handle clicks outside the modal using a one-time event listener
    const closeEditModalListener = function(e) {
      if (editModal.style.display === 'block' && !editModal.contains(e.target)) {
        editModal.style.display = 'none';
        if (editModal.parentNode) {
          document.body.removeChild(editModal);
        }
        removeOverlay();
        // Remove this event listener once it's been triggered
        document.removeEventListener('click', closeEditModalListener);
      }
    };
    
    // Add the event listener with a delay to prevent immediate triggering
    setTimeout(() => {
      document.addEventListener('click', closeEditModalListener);
    }, 100);
  }
  
  // Function to delete an event
  async function deleteEvent(event) {
    if (confirm('Are you sure you want to delete this event?')) {
      showLoading('Deleting event...');
      
      try {
        const res = await fetch('https://nzlrgp5k96.execute-api.us-east-1.amazonaws.com/dev/events', {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
            Authorization: 'Bearer ' + token
          },
          body: JSON.stringify({ id: event.id })
        });

        hideLoading();
        
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
        
        showToast('Event deleted successfully!', 'success');
      } catch (err) {
        hideLoading();
        showToast('Delete error: ' + err.message, 'error');
      }
    }
  }

  // Function to prompt for new event creation
  async function createEventPrompt(dateStr) {
    // Use modal instead of browser prompts
    createOverlay();
    
    // Store the date for later use
    createEventModal.dataset.date = dateStr;
    
    // Clear any previous values
    newEventTitleInput.value = '';
    newEventDescInput.value = '';
    
    // Show modal
    createEventModal.style.display = 'block';
    
    // Focus on the title input
    setTimeout(() => newEventTitleInput.focus(), 100);
    
    // Set up button handlers
    saveNewEventBtn.onclick = saveNewEvent;
    cancelNewEventBtn.onclick = () => {
      createEventModal.style.display = 'none';
      removeOverlay();
    };
  }
  
  // Function to save the new event
  async function saveNewEvent() {
    const title = newEventTitleInput.value.trim();
    if (!title) {
      showToast('Please enter an event title', 'error');
      return;
    }
    
    const description = newEventDescInput.value.trim();
    const dateStr = createEventModal.dataset.date;
    
    // Hide modal
    createEventModal.style.display = 'none';
    
    showLoading('Creating event...');
    
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
      
      hideLoading();
      removeOverlay();
      
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
      
      showToast('Event created successfully!', 'success');
    } catch (err) {
      hideLoading();
      removeOverlay();
      showToast('Create error: ' + err.message, 'error');
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
        updateEventDots();
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

  // Apply function to force calendar size after render
  function forceCalendarSize() {
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

  // Load events and render calendar
  (async () => {
    showLoading('Loading calendar events...');
    
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
      
      // Apply force sizing after render
      forceCalendarSize();
      
      // After the calendar is rendered, add dots to days with events
      setTimeout(() => {
        updateEventDots();
        hideLoading();
        
        // Force resize one more time after a delay
        forceCalendarSize();
      }, 100);
      
      // Make sure all event elements have cursor: pointer style
      document.querySelectorAll('.fc-event').forEach(el => {
        el.style.cursor = 'pointer';
      });
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
    setTimeout(forceCalendarSize, 200);
  });
});
