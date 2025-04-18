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
  // CSS styles remain unchanged from previous version
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

  // Store modal elements globally for easier access
  let eventModal, createEventModal, dayEventsModal;

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
    const createModal = document.createElement('div');
    createModal.id = 'createEventModal';
    createModal.style.display = 'none';
    createModal.style.position = 'fixed';
    createModal.style.zIndex = '1000';
    createModal.style.top = '50%';
    createModal.style.left = '50%';
    createModal.style.transform = 'translate(-50%, -50%)';
    createModal.style.background = '#fff';
    createModal.style.padding = '1.5rem';
    createModal.style.border = '1px solid #ccc';
    createModal.style.borderRadius = '12px';
    createModal.style.boxShadow = '0 4px 20px rgba(0,0,0,0.3)';
    createModal.style.minWidth = '300px';
    createModal.style.maxWidth = '90%';
    
    // Create day events modal for mobile
    const dayModal = document.createElement('div');
    dayModal.id = 'dayEventsModal';
    dayModal.style.display = 'none';
    dayModal.style.position = 'fixed';
    dayModal.style.zIndex = '1000';
    dayModal.style.top = '50%';
    dayModal.style.left = '50%';
    dayModal.style.transform = 'translate(-50%, -50%)';
    dayModal.style.background = '#fff';
    dayModal.style.padding = '1.5rem';
    dayModal.style.border = '1px solid #ccc';
    dayModal.style.borderRadius = '12px';
    dayModal.style.boxShadow = '0 4px 20px rgba(0,0,0,0.3)';
    dayModal.style.width = '90%';
    dayModal.style.maxWidth = '350px';
    dayModal.style.maxHeight = '80vh';
    dayModal.style.overflow = 'auto';
    
    dayModal.innerHTML = `
      <h3 id="dayModalTitle" style="margin-top: 0; color: #212529;"></h3>
      <ul class="day-events-list" id="dayEventsList"></ul>
      <div style="display: flex; justify-content: space-between; margin-top: 15px;">
        <button id="addEventBtn" style="background-color: #4361ee; color: white; border: none; box-shadow: 0 2px 6px rgba(67, 97, 238, 0.3); border-radius: 6px; padding: 8px 16px; font-weight: 500;">Add Event</button>
        <button id="closeDayModalBtn" style="background-color: #f2f2f2; color: #212529; border: none; border-radius: 6px; padding: 8px 16px; font-weight: 500;">Close</button>
      </div>
    `;
    
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
    createModal.innerHTML = `
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

    // Append modals to body
    document.body.appendChild(modal);
    document.body.appendChild(createModal);
    document.body.appendChild(dayModal);
    
    // Store references to the modals
    eventModal = modal;
    createEventModal = createModal;
    dayEventsModal = dayModal;
    
    // Set up event listeners for the modals
    setupModalEventListeners();
    
    return {
      eventModal: modal,
      createEventModal: createModal,
      dayEventsModal: dayModal
    };
  }
  
  // Set up event listeners for the modals
  function setupModalEventListeners() {
    // Get references to all buttons
    const closeBtn = document.getElementById('closeBtn');
    const closeDayModalBtn = document.getElementById('closeDayModalBtn');
    const cancelNewEventBtn = document.getElementById('cancelNewEventBtn');
    const addEventBtn = document.getElementById('addEventBtn');
    const saveNewEventBtn = document.getElementById('saveNewEventBtn');
    
    // Add event listeners for closing modals
    if (closeBtn) {
      closeBtn.onclick = function() {
        eventModal.style.display = 'none';
        removeOverlay();
      };
    }
    
    if (closeDayModalBtn) {
      closeDayModalBtn.onclick = function() {
        dayEventsModal.style.display = 'none';
        removeOverlay();
      };
    }
    
    if (cancelNewEventBtn) {
      cancelNewEventBtn.onclick = function() {
        createEventModal.style.display = 'none';
        removeOverlay();
      };
    }
    
    // Add event listener for Add Event button (in day events modal)
    if (addEventBtn) {
      addEventBtn.onclick = function() {
        // Get the date from the day events modal
        const dateStr = dayEventsModal.getAttribute('data-date');
        console.log('Add Event button clicked, date from attribute:', dateStr);
        
        // Hide day events modal
        dayEventsModal.style.display = 'none';
        removeOverlay();
        
        // Show create event modal with this date
        if (dateStr) {
          setTimeout(function() {
            createEventPrompt(dateStr);
          }, 100);
        } else {
          console.error('No date found for event creation!');
          showToast('Error: No date selected', 'error');
        }
      };
    }
    
    // Add event listener for Save button (in create event modal)
    if (saveNewEventBtn) {
      saveNewEventBtn.onclick = function() {
        saveNewEvent();
      };
    }
  }
  
  // Create the modals
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
    if (eventModal.style.display === 'block' && !eventModal.contains(event.target) &&
        !event.target.closest('.day-events-list li')) {
      eventModal.style.display = 'none';
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
        }, 200); // Increased delay to ensure DOM is updated
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
    // Get the latest references
    const modalTitleEl = document.getElementById('modalTitle');
    const modalDescEl = document.getElementById('modalDesc');
    const editBtn = document.getElementById('editBtn');
    const deleteBtn = document.getElementById('deleteBtn');
    const closeBtn = document.getElementById('closeBtn');
    
    if (!modalTitleEl || !modalDescEl || !editBtn || !deleteBtn || !closeBtn) {
      console.error('❌ Modal elements not found! Recreating...');
      createAllModals();
      return showEventModal(event); // Try again with new elements
    }

    createOverlay();
    modalTitleEl.textContent = event.title;
    modalDescEl.textContent = event.extendedProps.description || '(No description)';
    
    eventModal.style.display = 'block';
    
    // Set up event handlers
    editBtn.onclick = () => editEvent(event);
    deleteBtn.onclick = () => deleteEvent(event);
    closeBtn.onclick = () => {
      eventModal.style.display = 'none';
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
    
    // Store the date in the modal's attribute for later retrieval
    dayEventsModal.setAttribute('data-date', dateStr);
    console.log('Setting date attribute on dayEventsModal:', dateStr);
    
    // Set the title
    const dayModalTitleEl = document.getElementById('dayModalTitle');
    if (dayModalTitleEl) {
      dayModalTitleEl.textContent = formattedDate;
    }
    
    // Get events for this day
    const dayEvents = calendar.getEvents().filter(event => {
      const eventStart = new Date(event.start);
      return eventStart.toDateString() === date.toDateString();
    });
    
    // Populate the events list
    const dayEventsListEl = document.getElementById('dayEventsList');
    if (dayEventsListEl) {
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
    }
    
    // Show modal
    createOverlay();
    dayEventsModal.style.display = 'block';
    
    console.log('Day events modal displayed for date:', dateStr);
  }
  
  // Function to edit an event
  async function editEvent(event) {
    if (eventModal) {
      eventModal.style.display = 'none';
    }
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
        <button id="saveEditBtn" style="background-color: #4361ee; color: white; border: none; box-shadow: 0 2px 6px rgba(67, 97, 238, 0.3); border-radius: 6px; padding: 8px 16px; font-weight: 500;">Save</button>
        <button id="cancelEditBtn" style="background-color: #f2f2f2; color: #212529; border: none; border-radius: 6px; padding: 8px 16px; font-weight: 500;">Cancel</button>
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
    saveEditBtn.addEventListener('click', async function saveHandler() {
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

  // Function to prompt for new event creation
  function createEventPrompt(dateStr) {
    console.log('createEventPrompt called with date:', dateStr);
    
    // Use modal instead of browser prompts
    createOverlay();
    
    // Get a fresh reference to the modal elements
    let createEventModal = document.getElementById('createEventModal');
    
    // If the modal doesn't exist, recreate all modals
    if (!createEventModal) {
      console.error('Create event modal not found! Recreating...');
      createAllModals();
      createEventModal = document.getElementById('createEventModal');
      
      if (!createEventModal) {
        console.error('Still cannot find create event modal after recreation!');
        removeOverlay();
        showToast('Error creating event modal', 'error');
        return;
      }
    }
    
    // Store the date in the modal's dataset
    createEventModal.dataset.date = dateStr;
    console.log('Date stored in dataset:', createEventModal.dataset.date);
    
    // Get fresh references to the form inputs
    const newEventTitleInput = document.getElementById('newEventTitle');
    const newEventDescInput = document.getElementById('newEventDesc');
    
    if (!newEventTitleInput || !newEventDescInput) {
      console.error('Form inputs not found!');
      removeOverlay();
      showToast('Error loading form', 'error');
      return;
    }
    
    // Reset inputs
    newEventTitleInput.value = '';
    newEventDescInput.value = '';
    
    // Remove the form's current buttons container and recreate it
    const buttonContainer = createEventModal.querySelector('div:last-child');
    const newButtonContainer = document.createElement('div');
    newButtonContainer.style.display = 'flex';
    newButtonContainer.style.justifyContent = 'space-between';
    newButtonContainer.style.marginTop = '15px';
    
    // Create new save button
    const saveBtn = document.createElement('button');
    saveBtn.id = 'saveNewEventBtn';
    saveBtn.textContent = 'Save';
    saveBtn.style.backgroundColor = '#4361ee';
    saveBtn.style.color = 'white';
    saveBtn.style.border = 'none';
    saveBtn.style.boxShadow = '0 2px 6px rgba(67, 97, 238, 0.3)';
    saveBtn.style.borderRadius = '6px';
    saveBtn.style.padding = '8px 16px';
    saveBtn.style.fontWeight = '500';
    
    // Create new cancel button
    const cancelBtn = document.createElement('button');
    cancelBtn.id = 'cancelNewEventBtn';
    cancelBtn.textContent = 'Cancel';
    cancelBtn.style.backgroundColor = '#f2f2f2';
    cancelBtn.style.color = '#212529';
    cancelBtn.style.border = 'none';
    cancelBtn.style.borderRadius = '6px';
    cancelBtn.style.padding = '8px 16px';
    cancelBtn.style.fontWeight = '500';
    
    // Add buttons to the container
    newButtonContainer.appendChild(saveBtn);
    newButtonContainer.appendChild(cancelBtn);
    
    // Replace old buttons with new ones
    buttonContainer.parentNode.replaceChild(newButtonContainer, buttonContainer);
    
    // Add event listeners to new buttons
    const currentDateStr = dateStr; // Capture date in closure
    
    saveBtn.addEventListener('click', function() {
      console.log('Save button clicked, date from closure:', currentDateStr);
      saveNewEvent(currentDateStr);
    });
    
    cancelBtn.addEventListener('click', function() {
      createEventModal.style.display = 'none';
      removeOverlay();
    });
    
    // Show modal
    createEventModal.style.display = 'block';
    
    // Focus on the title input
    setTimeout(() => newEventTitleInput.focus(), 100);
    
    console.log('Event creation modal displayed with date:', dateStr);
  }
  
  // Function to save the new event
  async function saveNewEvent(dateStrFromParam) {
    console.log('saveNewEvent called with param date:', dateStrFromParam);
    
    const createEventModal = document.getElementById('createEventModal');
    const newEventTitleInput = document.getElementById('newEventTitle');
    const newEventDescInput = document.getElementById('newEventDesc');
    
    if (!createEventModal || !newEventTitleInput || !newEventDescInput) {
      console.error('Modal elements not found in saveNewEvent');
      showToast('Error saving event', 'error');
      return;
    }
    
    const title = newEventTitleInput.value.trim();
    if (!title) {
      showToast('Please enter an event title', 'error');
      return;
    }
    
    const description = newEventDescInput.value.trim();
    
    // Use date from parameter if provided, otherwise from modal dataset
    let dateStr = dateStrFromParam;
    if (!dateStr) {
      dateStr = createEventModal.dataset.date;
      console.log('Using date from dataset:', dateStr);
    }
    
    if (!dateStr) {
      console.error('No date found for event!');
      showToast('Error: No date selected', 'error');
      return;
    }
    
    // Hide modal
    createEventModal.style.display = 'none';
    
    showLoading('Creating event...');
    console.log('Sending request to create event for date:', dateStr);
    
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
      
      if (!res.ok || !data.id) {
        console.error('API response not OK:', res.status, data);
        throw new Error('Failed to create event');
      }

      console.log('Event created successfully with ID:', data.id);
      
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
      console.error('Error creating event:', err);
      hideLoading();
      removeOverlay();
      showToast('Create error: ' + err.message, 'error');
    }
  }
  
  // Function to add dots to days with events
  function updateEventDots() {
    if (!isMobile) return;
    
    console.log('Updating event dots...');
    
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
      }, 200);
      
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

}); // ← closes document.addEventListener('DOMContentLoaded', …)

// Set up loading indicator functions if not already implemented
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

// Add visible debug indicator that's more visible on mobile
(function() {
  function addDebugElement() {
    // Remove any existing debug element first
    const existingDebug = document.getElementById('calendar-debug-indicator');
    if (existingDebug) {
      existingDebug.parentNode.removeChild(existingDebug);
    }
    
    // Create new debug element with more visibility
    const debugEl = document.createElement('div');
    debugEl.id = 'calendar-debug-indicator';
    debugEl.style.position = 'fixed';
    debugEl.style.bottom = '10px';
    debugEl.style.left = '10px';
    debugEl.style.backgroundColor = 'rgba(0,0,0,0.8)';
    debugEl.style.color = 'white';
    debugEl.style.padding = '8px 12px';
    debugEl.style.fontSize = '14px';
    debugEl.style.fontWeight = 'bold';
    debugEl.style.borderRadius = '4px';
    debugEl.style.zIndex = '9999';
    debugEl.style.boxShadow = '0 2px 10px rgba(0,0,0,0.3)';
    debugEl.textContent = 'DEBUG:3 - FIXED ADD EVENT - ' + new Date().toISOString().substring(0, 19).replace('T', ' ');
    
    document.body.appendChild(debugEl);
    
    // Make it flash to be noticeable
    setTimeout(function() {
      debugEl.style.backgroundColor = 'rgba(255,0,0,0.8)';
      setTimeout(function() {
        debugEl.style.backgroundColor = 'rgba(0,0,0,0.8)';
      }, 500);
    }, 1000);
  }
  
  // Try to add it immediately if document is ready
  if (document.body) {
    addDebugElement();
  } else {
    // Otherwise wait for DOMContentLoaded
    window.addEventListener('DOMContentLoaded', addDebugElement);
  }
  
  // Also add it after a longer delay as a fallback
  setTimeout(addDebugElement, 2000);
})();

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
        }, 200); // Increased delay to ensure DOM is updated
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
    // Get the latest references
    const modalTitleEl = document.getElementById('modalTitle');
    const modalDescEl = document.getElementById('modalDesc');
    const editBtn = document.getElementById('editBtn');
    const deleteBtn = document.getElementById('deleteBtn');
    const closeBtn = document.getElementById('closeBtn');
    
    if (!modalTitleEl || !modalDescEl || !editBtn || !deleteBtn || !closeBtn) {
      console.error('❌ Modal elements not found! Recreating...');
      createAllModals();
      return showEventModal(event); // Try again with new elements
    }

    createOverlay();
    modalTitleEl.textContent = event.title;
    modalDescEl.textContent = event.extendedProps.description || '(No description)';
    
    const eventModal = document.getElementById('eventModal');
    eventModal.style.display = 'block';
    
    // Set up event handlers
    editBtn.onclick = () => editEvent(event);
    deleteBtn.onclick = () => deleteEvent(event);
    closeBtn.onclick = () => {
      eventModal.style.display = 'none';
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
    
    // Always get fresh references to these elements
    const dayModalTitleEl = document.getElementById('dayModalTitle');
    const dayEventsListEl = document.getElementById('dayEventsList');
    const dayEventsModal = document.getElementById('dayEventsModal');
    
    if (!dayModalTitleEl || !dayEventsListEl || !dayEventsModal) {
      console.error('Required day modal elements not found! Recreating...');
      createAllModals();
      return showDayEventsModal(date, dateStr); // Try again with new elements
    }
    
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
    
    // Remove and recreate buttons to clean up event listeners
    const buttonContainer = dayEventsModal.querySelector('div:last-child');
    const buttonContainerClone = buttonContainer.cloneNode(false); // shallow clone without children
    
    // Create new add event button
    const addEventBtn = document.createElement('button');
    addEventBtn.id = 'addEventBtn';
    addEventBtn.textContent = 'Add Event';
    addEventBtn.style.backgroundColor = '#4361ee';
    addEventBtn.style.color = 'white';
    addEventBtn.style.border = 'none';
    addEventBtn.style.boxShadow = '0 2px 6px rgba(67, 97, 238, 0.3)';
    addEventBtn.style.borderRadius = '6px';
    addEventBtn.style.padding = '8px 16px';
    addEventBtn.style.fontWeight = '500';
    
    // Create new close button
    const closeBtn = document.createElement('button');
    closeBtn.id = 'closeDayModalBtn';
    closeBtn.textContent = 'Close';
    closeBtn.style.backgroundColor = '#f2f2f2';
    closeBtn.style.color = '#212529';
    closeBtn.style.border = 'none';
    closeBtn.style.borderRadius = '6px';
    closeBtn.style.padding = '8px 16px';
    closeBtn.style.fontWeight = '500';
    
    // Add buttons to the container
    buttonContainerClone.appendChild(addEventBtn);
    buttonContainerClone.appendChild(closeBtn);
    
    // Replace old container with new one
    buttonContainer.parentNode.replaceChild(buttonContainerClone, buttonContainer);
    
    // Capture the dateStr in a local variable for the closure
    const selectedDateStr = dateStr;
    console.log('Setting up Add Event button for date:', selectedDateStr);
    
    // Add event listeners to new buttons
    addEventBtn.addEventListener('click', function() {
      dayEventsModal.style.display = 'none';
      removeOverlay();
      console.log('Add event button clicked for date:', selectedDateStr);
      setTimeout(function() {
        createEventPrompt(selectedDateStr);
      }, 100);
    });
    
    closeBtn.addEventListener('click', function() {
      dayEventsModal.style.display = 'none';
      removeOverlay();
    });
    
    // Show modal
    createOverlay();
    dayEventsModal.style.display = 'block';
    
    // Debug info
    console.log('Day events modal displayed for date:', dateStr);
  }
  
  // Function to edit an event
  async function editEvent(event) {
    const eventModal = document.getElementById('eventModal');
    if (eventModal) {
      eventModal.style.display = 'none';
    }
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
        <button id="saveEditBtn" style="background-color: #4361ee; color: white; border: none; box-shadow: 0 2px 6px rgba(67, 97, 238, 0.3); border-radius: 6px; padding: 8px 16px; font-weight: 500;">Save</button>
        <button id="cancelEditBtn" style="background-color: #f2f2f2; color: #212529; border: none; border-radius: 6px; padding: 8px 16px; font-weight: 500;">Cancel</button>
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
    saveEditBtn.addEventListener('click', async function saveHandler() {
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
    });
    
    cancelEditBtn.addEventListener('click', function() {
      editModal.style.display = 'none';
      document.body.removeChild(editModal);
      removeOverlay();
    });
    
    // Handle clicks outside the modal
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
    const eventModal = document.getElementById('eventModal');
    if (eventModal) {
      eventModal.style.display = 'none';
    }
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
        <button id="confirmDeleteBtn" style="background-color: #f72585; color: white; border: none; box-shadow: 0 2px 6px rgba(247, 37, 133, 0.3); border-radius: 6px; padding: 8px 16px; font-weight: 500;">Delete</button>
        <button id="cancelDeleteBtn" style="background-color: #f2f2f2; color: #212529; border: none; border-radius: 6px; padding: 8px 16px; font-weight: 500;">Cancel</button>
      </div>
    `;
    
    document.body.appendChild(confirmModal);
    createOverlay();
    
    // Get references to confirmation modal elements
    const confirmDeleteBtn = document.getElementById('confirmDeleteBtn');
    const cancelDeleteBtn = document.getElementById('cancelDeleteBtn');
    
    // Set up button handlers
    confirmDeleteBtn.addEventListener('click', async function() {
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
    });
    
    cancelDeleteBtn.addEventListener('click', function() {
      confirmModal.style.display = 'none';
      document.body.removeChild(confirmModal);
      removeOverlay();
    });
    
    // Handle clicks outside the modal
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
