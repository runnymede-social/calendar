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
    
    /* Direct border fix */
    .fc, .fc table, .fc table tr, .fc table td, .fc table th {
      border-color: #e0e0e0 !important;
    }
    
    /* Calendar container styling */
    #calendar {
      border-radius: var(--border-radius) !important;
      overflow: hidden !important;
      box-shadow: var(--box-shadow) !important;
      background-color: white !important;
      border: 1px solid #e0e0e0 !important;
    }
    
    /* Force all borders to be visible */
    .fc .fc-scrollgrid {
      border: 1px solid #e0e0e0 !important;
    }
    
    .fc .fc-scrollgrid-section-header > *, 
    .fc .fc-scrollgrid-section-body > * {
      border: 1px solid #e0e0e0 !important;
    }
    
    .fc-theme-standard td, 
    .fc-theme-standard th {
      border: 1px solid #e0e0e0 !important;
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
        width: calc(100% - 20px) !important; /* Fix width issue */
        border: 1px solid #e0e0e0 !important; /* Add border for mobile */
        box-shadow: var(--box-shadow) !important;
      }
      
      /* Ensure table fills container */
      .fc-scrollgrid {
        width: 100% !important;
        border: 1px solid #e0e0e0 !important;
      }
      
      .fc-theme-standard td, 
      .fc-theme-standard th {
        border: 1px solid #e0e0e0 !important;
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
        border-left: 5px solid var(--primary-color) !important; /* Ensure border shows up */
        transition: var(--transition);
        box-shadow: 0 2px 6px rgba(0, 0, 0, 0.05);
      }
      
      .day-events-list li:nth-of-type(4n+1) {
        border-left-color: var(--primary-color) !important;
      }
      
      .day-events-list li:nth-of-type(4n+2) {
        border-left-color: var(--accent-color-1) !important;
      }
      
      .day-events-list li:nth-of-type(4n+3) {
        border-left-color: var(--accent-color-2) !important;
      }
      
      .day-events-list li:nth-of-type(4n+4) {
        border-left-color: var(--secondary-color) !important;
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

  // Create all our modals
  function createAllModals() {
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
        <button id="addEventBtn" style="background-color: #4361ee; color: white; border: none; box-shadow: 0 2px 6px rgba(67, 97, 238, 0.3); border-radius: 6px; padding: 8px 16px; font-weight: 500;">Add Event</button>
        <button id="closeDayModalBtn" style="background-color: #f2f2f2; color: #212529; border: none; border-radius: 6px; padding: 8px 16px; font-weight: 500;">Close</button>
      </div>
    `;
    
    document.body.appendChild(dayEventsModal);
    
    // Regular event modal content
    modal.innerHTML = `
      <h3 id="modalTitle" style="margin-top: 0; color: #212529;"></h3>
      <p id="modalDesc" style="color: #6c757d;"></p>
      <div style="display: flex; justify-content: space-between; margin-top: 15px;">
        <button id="editBtn" style="background-color: #4361ee; color: white; border: none; box-shadow: 0 2px 6px rgba(67, 97, 238, 0.3); border-radius: 6px; padding: 8px 16px; font-weight: 500;">Edit</button>
        <button id="deleteBtn" style="background-color: #f72585; color: white; border: none; box-shadow: 0 2px 6px rgba(247, 37, 133, 0.3); border-radius: 6px; padding: 8px 16px; font-weight: 500;">Delete</button>
        <button id="closeBtn" style="background-color: #f2f2f2; color: #212529; border: none; border-radius: 6px; padding: 8px 16px; font-weight: 500;">Close</button>
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
      <input type="hidden" id="eventDate">
      <div style="display: flex; justify-content: space-between; margin-top: 15px;">
        <button id="saveNewEventBtn" style="background-color: #4361ee; color: white; border: none; box-shadow: 0 2px 6px rgba(67, 97, 238, 0.3); border-radius: 6px; padding: 8px 16px; font-weight: 500;">Save</button>
        <button id="cancelNewEventBtn" style="background-color: #f2f2f2; color: #212529; border: none; border-radius: 6px; padding: 8px 16px; font-weight: 500;">Cancel</button>
      </div>
    `;

    document.body.appendChild(modal);
    document.body.appendChild(createEventModal);
    
    return {
      eventModal: modal,
      createEventModal: createEventModal,
      dayEventsModal: dayEventsModal
    };
  }
  
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
  function showLoading(message = 'Loading...
