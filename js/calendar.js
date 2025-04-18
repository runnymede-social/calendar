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
    /* Modern Calendar Theme - Updated Styles */
    :root {
      --primary-color: #4361ee;
      --secondary-color: #3a0ca3;
      --accent-color-1: #7209b7;
      --accent-color-2: #f72585;
      --accent-color-3: #4cc9f0;
      --light-color: #f8f9fa;
      --dark-color: #212529;
      --border-radius: 12px;
      --event-radius: 6px;
      --box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
      --transition: all 0.3s ease;
    }
    
    body {
      background-color: var(--light-color);
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
    }
    
    /* Calendar container styling */
    #calendar {
      border-radius: var(--border-radius) !important;
      overflow: hidden !important;
      box-shadow: var(--box-shadow) !important;
      background-color: white !important;
      border: none !important;
    }
    
    /* Calendar header styling */
    .fc-header-toolbar {
      padding: 16px !important;
      background: white !important;
    }
    
    .fc-toolbar-title {
      font-weight: 700 !important;
      color: var(--dark-color) !important;
    }
    
    /* Navigation buttons */
    .fc-button-primary {
      background-color: var(--primary-color) !important;
      border-color: var(--primary-color) !important;
      border-radius: var(--event-radius) !important;
      transition: var(--transition) !important;
      box-shadow: 0 2px 6px rgba(67, 97, 238, 0.3) !important;
    }
    
    .fc-button-primary:hover {
      background-color: #3b54d3 !important;
      border-color: #3b54d3 !important;
    }
    
    /* Calendar table styling */
    .fc-scrollgrid {
      border: none !important;
    }
    
    .fc-col-header {
      background-color: white !important;
    }
    
    .fc-col-header-cell {
      padding: 10px 0 !important;
      font-weight: 600 !important;
      color: var(--dark-color) !important;
    }
    
    .fc-daygrid-day {
      transition: var(--transition) !important;
    }
    
    .fc-daygrid-day:hover {
      background-color: rgba(76, 201, 240, 0.1) !important;
    }
    
    .fc-daygrid-day-number {
      font-weight: 500 !important;
      color: var(--dark-color) !important;
      padding: 8px !important;
    }
    
    /* Today highlighting */
    .fc-day-today {
      background-color: rgba(76, 201, 240, 0.15) !important;
    }
    
    .fc-day-today .fc-daygrid-day-number {
      background-color: var(--accent-color-3) !important;
      color: white !important;
      border-radius: 50% !important;
      width: 30px !important;
      height: 30px !important;
      display: flex !important;
      align-items: center !important;
      justify-content: center !important;
      margin: 5px !important;
    }
    
    /* Event styling */
    .fc-event {
      border-radius: var(--event-radius) !important;
      border: none !important;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1) !important;
      transition: var(--transition) !important;
    }
    
    .fc-event:hover {
      transform: translateY(-1px) !important;
      box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15) !important;
    }
    
    /* Colorful events by type - auto-assigned colors */
    .fc-event:nth-of-type(4n+1) {
      background-color: var(--primary-color) !important;
    }
    
    .fc-event:nth-of-type(4n+2) {
      background-color: var(--accent-color-1) !important;
    }
    
    .fc-event:nth-of-type(4n+3) {
      background-color: var(--accent-color-2) !important;
    }
    
    .fc-event:nth-of-type(4n+4) {
      background-color: var(--secondary-color) !important;
    }
    
    /* Event dots for mobile */
    .event-dot {
      width: 10px !important;
      height: 10px !important;
      border-radius: 50% !important;
      margin: 4px auto !important;
      display: block !important;
      background-color: var(--primary-color) !important;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1) !important;
    }
    
    .event-dot:nth-of-type(4n+1) {
      background-color: var(--primary-color) !important;
    }
    
    .event-dot:nth-of-type(4n+2) {
      background-color: var(--accent-color-1) !important;
    }
    
    .event-dot:nth-of-type(4n+3) {
      background-color: var(--accent-color-2) !important;
    }
    
    .event-dot:nth-of-type(4n+4) {
      background-color: var(--secondary-color) !important;
    }
    
    /* Modal styling */
    #eventModal, #createEventModal, #dayEventsModal, #editEventModal, #confirmDeleteModal {
      border-radius: var(--border-radius) !important;
      box-shadow: 0 10px 30px rgba(0, 0, 0, 0.15) !important;
      border: none !important;
    }
    
    /* Form inputs */
    input, textarea {
      border-radius: var(--event-radius) !important;
      border: 1px solid #dee2e6 !important;
      padding: 10px 12px !important;
      transition: var(--transition) !important;
    }
    
    input:focus, textarea:focus {
      border-color: var(--primary-color) !important;
      box-shadow: 0 0 0 3px rgba(67, 97, 238, 0.2) !important;
      outline: none !important;
    }
    
    /* Buttons styling */
    button {
      border-radius: var(--event-radius) !important;
      padding: 8px 16px !important;
      font-weight: 500 !important;
      transition: var(--transition) !important;
    }
    
    /* Logout button styles */
    #logoutContainer {
      position: absolute;
      right: 15px;
      top: 15px;
      z-index: 100;
    }
    
    #logoutBtn {
      background-color: white !important;
      color: var(--dark-color) !important;
      border: none !important;
      padding: 8px 15px !important;
      border-radius: var(--event-radius) !important;
      cursor: pointer !important;
      font-size: 14px !important;
      display: flex !important;
      align-items: center !important;
      transition: var(--transition) !important;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1) !important;
    }
    
    #logoutBtn:hover {
      background-color: #f8f9fa !important;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15) !important;
    }
    
    #logoutBtn svg {
      margin-right: 5px;
    }
    
    /* Button styles */
    #deleteBtn, #confirmDeleteBtn {
      background-color: var(--accent-color-2) !important; 
      color: white !important;
      border: none !important;
      padding: 8px 12px !important;
      border-radius: var(--event-radius) !important;
      cursor: pointer !important;
      box-shadow: 0 2px 6px rgba(247, 37, 133, 0.3) !important;
    }
    
    #deleteBtn:hover, #confirmDeleteBtn:hover {
      background-color: #e91f7a !important;
    }
    
    #editBtn, #addEventBtn, #saveNewEventBtn, #saveEditBtn {
      background-color: var(--primary-color) !important;
      color: white !important;
      border: none !important;
      box-shadow: 0 2px 6px rgba(67, 97, 238, 0.3) !important;
    }
    
    #editBtn:hover, #addEventBtn:hover, #saveNewEventBtn:hover, #saveEditBtn:hover {
      background-color: #3b54d3 !important;
    }
    
    #closeBtn, #cancelNewEventBtn, #closeDayModalBtn, #cancelEditBtn, #cancelDeleteBtn {
      background-color: #f2f2f2 !important;
      color: var(--dark-color) !important;
      border: none !important;
    }
    
    #closeBtn:hover, #cancelNewEventBtn:hover, #closeDayModalBtn:hover, #cancelEditBtn:hover, #cancelDeleteBtn:hover {
      background-color: #e6e6e6 !important;
    }
    
    /* IMPORTANT: Ensure desktop styles are applied strongly */
    @media (min-width: 769px) {
      #calendar {
        min-height: 800px !important;
        height: 800px !important;
        max-width: 1200px !important;
        margin: 20px auto !important;
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
      background-color: rgba(255,255,255,0.8);
      z-index: 2000;
      display: flex;
      justify-content: center;
      align-items: center;
      flex-direction: column;
      backdrop-filter: blur(3px);
    }
    
    .loading-spinner {
      width: 50px;
      height: 50px;
      border: 3px solid rgba(67, 97, 238, 0.1);
      border-top: 3px solid var(--primary-color);
      border-radius: 50%;
      animation: spin 1s linear infinite;
      margin-bottom: 15px;
    }
    
    .loading-text {
      font-size: 18px;
      color: var(--dark-color);
      font-weight: 500;
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
      background-color: var(--dark-color);
      color: white;
      padding: 12px 24px;
      border-radius: var(--event-radius);
      font-size: 16px;
      font-weight: 500;
      z-index: 2000;
      opacity: 0;
      transition: opacity 0.3s ease-in-out;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
    }
    
    .toast.show {
      opacity: 1;
    }
    
    .toast.success {
      background-color: #4CAF50;
    }
    
    .toast.error {
      background-color: var(--accent-color-2);
    }
    
    /* Mobile specific styles */
    @media (max-width: 768px) {
      #calendar {
        height: auto !important;
        margin: 10px !important;
        border-radius: var(--border-radius) !important;
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
      
      #calendar .fc-daygrid-body {
        width: 100% !important;
      }
      
      #eventModal, #dayEventsModal, #createEventModal, #editEventModal, #confirmDeleteModal {
        width: 90% !important;
        max-width: 350px;
      }
      
      .day-events-list {
        margin-top: 10px;
        padding-left: 0;
      }
      
      .day-events-list li {
        background: #f8f9fa;
        margin-bottom: 8px;
        padding: 12px;
        border-radius: var(--event-radius);
        list-style-type: none;
        border-left: 5px solid var(--primary-color);
        transition: var(--transition);
        box-shadow: 0 2px 6px rgba(0, 0, 0, 0.05);
      }
      
      .day-events-list li:nth-of-type(4n+1) {
        border-left-color: var(--primary-color);
      }
      
      .day-events-list li:nth-of-type(4n+2) {
        border-left-color: var(--accent-color-1);
      }
      
      .day-events-list li:nth-of-type(4n+3) {
        border-left-color: var(--accent-color-2);
      }
      
      .day-events-list li:nth-of-type(4n+4) {
        border-left-color: var(--secondary-color);
      }
      
      .day-events-list li:hover {
        transform: translateY(-2px);
        box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
      }
      
      .day-events-list li .event-title {
        font-weight: bold;
        color: var(--dark-color);
      }
      
      .day-events-list li .event-description {
        font-size: 0.9rem;
        color: #6c757d;
        margin-top: 5px;
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
  modal.style.padding = '1.5rem';
  modal.style.border = '1px solid #ccc';
  modal.style.borderRadius = '12px';
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
  createEventModal.style.padding = '1.5rem';
  createEventModal.style.border = '1px solid #ccc';
  createEventModal.style.borderRadius = '12px';
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
  dayEventsModal.style.padding = '1.5rem';
  dayEventsModal.style.border = '1px solid #ccc';
  dayEventsModal.style.borderRadius = '12px';
  dayEventsModal.style.boxShadow = '0 4px 20px rgba(0,0,0,0.3)';
  dayEventsModal.style.width = '90%';
  dayEventsModal.style.maxWidth = '350px';
  dayEventsModal.style.maxHeight = '80vh';
  dayEventsModal.style.overflow = 'auto';
  
  dayEventsModal.innerHTML = `
    <h3 id="dayModalTitle" style="margin-top: 0; color: #212529;"></h3>
    <ul class="day-events-list" id="dayEventsList"></ul>
    <div style="display: flex; justify-content: space-between; margin-top: 15px;">
      <button id="addEventBtn">Add Event</button>
      <button id="closeDayModalBtn">Close</button>
    </div>
  `;
  
  document.body.appendChild(dayEventsModal);
  
  // Regular event modal content
  modal.innerHTML = `
    <h3 id="modalTitle" style="margin-top: 0; color: #212529;"></h3>
    <p id="modalDesc" style="color: #6c757d;"></p>
    <div style="display: flex; justify-content: space-between; margin-top: 15px;">
      <button id="editBtn">Edit</button>
      <button id="deleteBtn">Delete</button>
      <button id="closeBtn">Close</button>
    </div>
  `;

  // Create event modal content
  createEventModal.innerHTML = `
    <h3 style="margin-top: 0; color: #212529;">Create New Event</h3>
    <div style="margin: 15px 0;">
      <label for="newEventTitle" style="display: block; margin-bottom: 5px; font-weight: bold; color: #212529;">Event Title:</label>
      <input type="text" id="newEventTitle" style="width: 100%; padding: 10px; border: 1px solid #ccc; border-radius: 6px; font-size: 16px; box-sizing: border-box;">
    </div>
    <div style="margin: 15px 0;">
      <label for="newEventDesc" style="display: block; margin-bottom: 5px; font-weight: bold; color: #212529;">Description:</label>
      <textarea id="newEventDesc" style="width: 100%; padding: 10px; border: 1px solid #ccc; border-radius: 6px; font-size: 16px; box-sizing: border-box; min-height: 80px;"></textarea>
    </div>
    <div style="display: flex; justify-content: space-between; margin-top: 15px;">
      <button id="saveNewEventBtn">Save</button>
      <button id="cancelNewEventBtn">Cancel</button>
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
    overlay.style.backdropFilter = 'blur(3px)';
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
    editModal.style.padding = '1.5rem';
    editModal.style.border = '1px solid #ccc';
    editModal.style.borderRadius = '12px';
    editModal.style.boxShadow = '0 10px 30px rgba(0,0,0,0.15)';
    editModal.style.minWidth = '300px';
    editModal.style.maxWidth = '90%';
    
    editModal.innerHTML = `
      <h3 style="margin-top: 0; color: #212529;">Edit Event</h3>
      <div style="margin: 15px 0;">
        <label for="editEventTitle" style="display: block; margin-bottom: 5px; font-weight: bold; color: #212529;">Event Title:</label>
        <input type="text" id="editEventTitle" value="${event.title}" style="width: 100%; padding: 10px; border: 1px solid #ccc; border-radius: 6px; font-size: 16px; box-sizing: border-box;">
      </div>
      <div style="margin: 15px 0;">
        <label for="editEventDesc" style="display: block; margin-bottom: 5px; font-weight: bold; color: #212529;">Description:</label>
        <textarea id="editEventDesc" style="width: 100%; padding: 10px; border: 1px solid #ccc; border-radius: 6px; font-size: 16px; box-sizing: border-box; min-height: 80px;">${event.extendedProps.description || ''}</textarea>
      </div>
      <div style="display: flex; justify-content: space-between; margin-top: 15px;">
        <button id="saveEditBtn">Save</button>
        <button id="cancelEditBtn">Cancel</button>
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
    modal.style.display = 'none';
    removeOverlay();
    
    // Create a confirmation modal
    const confirmModal = document.createElement('div');
    confirmModal.id = 'confirmDeleteModal';
    confirmModal.style.display = 'block';
    confirmModal.style.position = 'fixed';
    confirmModal.style.zIndex = '1000';
    confirmModal.style.top = '50%';
    confirmModal.style.left = '50%';
    confirmModal.style.transform = 'translate(-50%, -50%)';
    confirmModal.style.background = '#fff';
    confirmModal.style.padding = '1.5rem';
    confirmModal.style.border = '1px solid #ccc';
    confirmModal.style.borderRadius = '12px';
    confirmModal.style.boxShadow = '0 10px 30px rgba(0,0,0,0.15)';
    confirmModal.style.minWidth = '300px';
    confirmModal.style.maxWidth = '90%';
    
    confirmModal.innerHTML = `
      <h3 style="margin-top: 0; color: #212529;">Confirm Delete</h3>
      <p>Are you sure you want to delete this event: "${event.title}"?</p>
      <div style="display: flex; justify-content: space-between; margin-top: 15px;">
        <button id="confirmDeleteBtn">Delete</button>
        <button id="cancelDeleteBtn">Cancel</button>
      </div>
    `;
    
    document.body.appendChild(confirmModal);
    createOverlay();
    
    // Get references to confirmation modal elements
    const confirmDeleteBtn = document.getElementById('confirmDeleteBtn');
    const cancelDeleteBtn = document.getElementById('cancelDeleteBtn');
    
    // Set up button handlers
    confirmDeleteBtn.onclick = async function() {
      // Remove the confirmation modal
      confirmModal.style.display = 'none';
      document.body.removeChild(confirmModal);
      
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
        removeOverlay();
        
        if (!res.ok) throw new Error('Failed to delete event');
        
        // Remove event from calendar
        event.remove();
        
        // Update the dots for mobile view
        if (isMobile) {
          updateEventDots();
        }
        
        showToast('Event deleted successfully!', 'success');
      } catch (err) {
        hideLoading();
        removeOverlay();
        showToast('Delete error: ' + err.message, 'error');
      }
    };
    
    cancelDeleteBtn.onclick = function() {
      confirmModal.style.display = 'none';
      document.body.removeChild(confirmModal);
      removeOverlay();
    };
    
    // Handle clicks outside the modal using a one-time event listener
    const closeConfirmModalListener = function(e) {
      if (confirmModal.style.display === 'block' && !confirmModal.contains(e.target)) {
        confirmModal.style.display = 'none';
        if (confirmModal.parentNode) {
          document.body.removeChild(confirmModal);
        }
        removeOverlay();
        // Remove this event listener once it's been triggered
        document.removeEventListener('click', closeConfirmModalListener);
      }
    };
    
    // Add the event listener with a delay to prevent immediate triggering
    setTimeout(() => {
      document.addEventListener('click', closeConfirmModalListener);
    }, 100);
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
      
      // Count events per day for different colored dots
      if (!eventDates[dateStr]) {
        eventDates[dateStr] = 1;
      } else {
        eventDates[dateStr]++;
      }
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
          
          // Add a class modifier based on the event count (for color variation)
          const count = eventDates[dateAttr] % 4; // 0-3 range for 4 colors
          dot.classList.add(`event-dot-${count}`);
          
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
