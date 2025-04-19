// CSS styling for the calendar application - With better bottom spacing
export function setupStyles() {
  const forceDesktopStyles = document.createElement('style');
  forceDesktopStyles.textContent = `
    /* Modern Calendar Theme - Updated Styles with proper bottom spacing */
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
      margin: 0;
      padding: 0;
      min-height: 100vh;
      overflow-y: auto; /* Allow vertical scrolling if needed */
    }
    
    /* Full-screen container setup */
    .container {
      width: 100%;
      padding: 0;
      max-width: 100% !important;
      display: flex;
      flex-direction: column;
    }
    
    /* Prevent zooming and text size adjustment */
    input, textarea, select, button {
      font-size: 16px !important; /* Prevents iOS zoom on focus */
    }
    
    /* Direct border fix */
    .fc, .fc table, .fc table tr, .fc table td, .fc table th {
      border-color: #e0e0e0 !important;
    }
    
    /* Calendar container styling for full-screen */
    #calendar {
      border-radius: var(--border-radius) !important;
      overflow: hidden !important;
      box-shadow: var(--box-shadow) !important;
      background-color: white !important;
      border: 1px solid #e0e0e0 !important;
      /* Take up most of the viewport but leave space for reminders */
      height: calc(82vh) !important;
      margin: 15px 20px 10px 20px !important;
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
    
    /* Calendar header styling - compact */
    .fc-header-toolbar {
      padding: 8px 16px !important;
      background: white !important;
      margin-bottom: 0.5em !important; /* Reduce margin */
    }
    
    .fc-toolbar-title {
      font-weight: 700 !important;
      color: var(--dark-color) !important;
      font-size: 1.5em !important; /* Slightly smaller title */
    }
    
    /* Navigation buttons */
    .fc-button-primary {
      background-color: var(--primary-color) !important;
      border-color: var(--primary-color) !important;
      border-radius: var(--event-radius) !important;
      transition: var(--transition) !important;
      box-shadow: 0 2px 6px rgba(67, 97, 238, 0.3) !important;
      padding: 0.25em 0.65em !important; /* Smaller padding */
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
      padding: 8px 0 !important; /* Reduced padding */
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
      padding: 4px 8px !important; /* Reduced padding */
    }
    
    /* Today highlighting */
    .fc-day-today {
      background-color: rgba(76, 201, 240, 0.15) !important;
    }
    
    .fc-day-today .fc-daygrid-day-number {
      background-color: var(--accent-color-3) !important;
      color: white !important;
      border-radius: 50% !important;
      width: 25px !important; /* Slightly smaller */
      height: 25px !important;
      display: flex !important;
      align-items: center !important;
      justify-content: center !important;
      margin: 4px !important;
    }
    
    /* Event styling */
    .fc-event {
      border-radius: var(--event-radius) !important;
      border: none !important;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1) !important;
      transition: var(--transition) !important;
      padding: 2px 4px !important; /* Compact padding */
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
      width: 8px !important; /* Smaller dot */
      height: 8px !important;
      border-radius: 50% !important;
      margin: 3px auto !important;
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
    input, textarea, select {
      border-radius: var(--event-radius) !important;
      border: 1px solid #dee2e6 !important;
      padding: 10px 12px !important;
      transition: var(--transition) !important;
      width: 100% !important;
      margin-bottom: 10px !important;
      box-sizing: border-box !important;
    }
    
    input:focus, textarea:focus, select:focus {
      border-color: var(--primary-color) !important;
      box-shadow: 0 0 0 3px rgba(67, 97, 238, 0.2) !important;
      outline: none !important;
    }
    
    label {
      display: block !important;
      margin-bottom: 5px !important;
      font-weight: bold !important;
      color: var(--dark-color) !important;
    }
    
    /* Form field container */
    .form-field {
      margin-bottom: 15px !important;
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
      right: 20px;
      top: 20px;
      z-index: 100;
    }
    
    #logoutBtn {
      background-color: white !important;
      color: var(--dark-color) !important;
      border: none !important;
      padding: 6px 12px !important; /* Smaller padding */
      border-radius: var(--event-radius) !important;
      cursor: pointer !important;
      font-size: 13px !important; /* Slightly smaller font */
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
      width: 14px !important; /* Smaller icon */
      height: 14px !important;
    }
    
    /* Button styles */
    .primary-btn {
      background-color: var(--primary-color) !important;
      color: white !important;
      border: none !important;
      box-shadow: 0 2px 6px rgba(67, 97, 238, 0.3) !important;
    }
    
    .primary-btn:hover {
      background-color: #3b54d3 !important;
    }
    
    .danger-btn {
      background-color: var(--accent-color-2) !important; 
      color: white !important;
      border: none !important;
      box-shadow: 0 2px 6px rgba(247, 37, 133, 0.3) !important;
    }
    
    .danger-btn:hover {
      background-color: #e91f7a !important;
    }
    
    .default-btn {
      background-color: #f2f2f2 !important;
      color: var(--dark-color) !important;
      border: none !important;
    }
    
    .default-btn:hover {
      background-color: #e6e6e6 !important;
    }
    
    /* IMPORTANT: Full-screen calendar for desktop */
    @media (min-width: 769px) {
      #calendar {
        /* Take up less space to ensure reminders are fully visible */
        height: calc(80vh) !important;
        margin: 15px 20px 10px 20px !important;
        max-width: none !important; /* Remove max-width constraint */
      }
      
      /* For shorter calendar cells to fit everything */
      .fc-view-harness {
        min-height: calc(80vh - 150px) !important;
      }
      
      .fc .fc-daygrid-day {
        min-height: calc((80vh - 150px) / 6) !important; /* Dividing by approx number of rows */
      }
      
      .fc-daygrid-day-frame {
        min-height: calc((80vh - 150px) / 6) !important;
      }
      
      /* Force larger calendar on desktop */
      .fc-view-harness, .fc-view-harness-active, .fc-daygrid {
        height: auto !important;
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
      body {
        overflow-y: auto; /* Allow scrolling on mobile */
      }
      
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
      
      /* Mobile specific logout button */
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
      
      .day-events-list li .event-who,
      .day-events-list li .event-when {
        font-size: 0.85rem;
        color: #6c757d;
        margin-top: 3px;
      }
    }
    
    /* Calendar Messages Section - More visible */
    #calendar-messages {
      margin: 10px 20px 30px 20px !important; /* Increased bottom margin */
      padding: 10px 15px !important;
      border-radius: var(--border-radius);
      background-color: white;
      box-shadow: var(--box-shadow);
      min-height: 80px; /* Ensure a minimum height */
      max-height: calc(18vh); /* Maximum height */
      overflow-y: auto; /* Add scrollbar if content exceeds height */
    }
    
    #calendar-messages h3 {
      margin-top: 0;
      margin-bottom: 8px !important;
      color: var(--dark-color);
      font-size: 1rem !important; /* Smaller heading */
      border-bottom: 1px solid #ddd;
      padding-bottom: 5px !important;
    }
    
    .message-item {
      padding: 8px !important;
      margin-bottom: 6px !important;
      border-left: 4px solid var(--primary-color);
      background-color: var(--light-color);
      border-radius: var(--event-radius);
      font-size: 0.9rem !important; /* Slightly smaller font */
    }
    
    .message-date {
      font-weight: bold;
      color: #666;
      margin-right: 8px;
    }
    
    .message-text {
      color: var(--dark-color);
    }
    
    .message-priority-high {
      border-left-color: var(--accent-color-2);
    }
    
    .message-priority-medium {
      border-left-color: var(--accent-color-1);
    }
    
    .message-priority-low {
      border-left-color: var(--primary-color);
    }
    
    /* Line break preservation for descriptions */
    .event-description, 
    #modalDesc,
    .day-events-list li .event-description {
      white-space: pre-wrap !important;
    }
    
    /* Make textareas preserve line breaks and resize vertically */
    textarea {
      white-space: pre-wrap !important;
      font-family: inherit !important;
      font-size: inherit !important;
      resize: vertical !important;
      min-height: 80px !important;
    }
  `;
  document.head.appendChild(forceDesktopStyles);
}
