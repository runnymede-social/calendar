// Event Handlers for Calendar Application
// Manages event creation, editing, deletion, and display

import { createOverlay, removeOverlay, showToast, showLoading, hideLoading, createEditModal, createDeleteModal } from './ui-components.js';

// Function to show event modal - VIEWING ONLY
export function showEventModal(event, calendar, isMobile, token) {
  const eventModal = document.getElementById('eventModal');
  const modalTitleEl = document.getElementById('modalTitle');
  const modalDescEl = document.getElementById('modalDesc');
  const modalWhoEl = document.getElementById('modalWho');
  const modalWhenEl = document.getElementById('modalWhen');
  const editBtn = document.getElementById('editBtn');
  const deleteBtn = document.getElementById('deleteBtn');
  const closeBtn = document.getElementById('closeBtn');
  
  if (!modalTitleEl || !modalDescEl || !editBtn || !deleteBtn || !closeBtn) {
    console.error('❌ Modal elements not found!');
    return;
  }

  createOverlay();
  modalTitleEl.textContent = event.title;
  
  // Preserve line breaks in description by using white-space: pre-wrap
  modalDescEl.style.whiteSpace = 'pre-wrap';
  modalDescEl.textContent = event.extendedProps.description || '(No description)';
  
  // Add Who and When information
  if (event.extendedProps.who) {
    modalWhoEl.innerHTML = `<strong>Who:</strong> ${event.extendedProps.who}`;
  } else {
    modalWhoEl.innerHTML = '';
  }
  
  if (event.extendedProps.when) {
    modalWhenEl.innerHTML = `<strong>When:</strong> ${event.extendedProps.when}`;
  } else {
    modalWhenEl.innerHTML = '';
  }
  
  eventModal.style.display = 'block';
  
  // Set up event handlers
  editBtn.onclick = () => editEvent(event, token, calendar, isMobile);
  deleteBtn.onclick = () => deleteEvent(event, token, calendar, isMobile);
  closeBtn.onclick = () => {
    eventModal.style.display = 'none';
    removeOverlay();
  };
  
  // Add ability to close VIEW modal by clicking outside
  // (but not for edit modals which will be handled differently)
  const closeViewModalListener = function(e) {
    if (eventModal.style.display === 'block' && 
        !eventModal.contains(e.target) && 
        !e.target.closest('.day-events-list li')) {
      eventModal.style.display = 'none';
      removeOverlay();
      // Remove this event listener once triggered
      document.removeEventListener('click', closeViewModalListener);
    }
  };
  
  // Add the event listener with a slight delay to prevent immediate triggering
  setTimeout(() => {
    document.addEventListener('click', closeViewModalListener);
  }, 100);
}

// Function to show day events modal on mobile - VIEWING ONLY
export function showDayEventsModal(date, dateStr, calendar, isMobile, token) {
  const formattedDate = date.toLocaleDateString('en-US', { 
    weekday: 'long', 
    month: 'long', 
    day: 'numeric' 
  });
  
  // Get references to modal elements
  const dayEventsModal = document.getElementById('dayEventsModal');
  const dayModalTitleEl = document.getElementById('dayModalTitle');
  const dayEventsListEl = document.getElementById('dayEventsList');
  const addEventBtn = document.getElementById('addEventBtn');
  const closeDayModalBtn = document.getElementById('closeDayModalBtn');
  
  if (!dayModalTitleEl || !dayEventsListEl || !addEventBtn || !closeDayModalBtn || !dayEventsModal) {
    console.error('Required day modal elements not found!');
    return;
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
      
      // Build HTML with title, description, who, and when
      let html = `<div class="event-title">${event.title}</div>`;
      
      if (event.extendedProps.description) {
        // Preserve line breaks in description by using a div with white-space: pre-wrap
        html += `<div class="event-description" style="white-space: pre-wrap;">${event.extendedProps.description}</div>`;
      }
      
      if (event.extendedProps.who) {
        html += `<div class="event-who"><strong>Who:</strong> ${event.extendedProps.who}</div>`;
      }
      
      if (event.extendedProps.when) {
        html += `<div class="event-when"><strong>When:</strong> ${event.extendedProps.when}</div>`;
      }
      
      li.innerHTML = html;
      
      // Add click handler to open event details
      li.addEventListener('click', function() {
        // Hide day events modal
        dayEventsModal.style.display = 'none';
        removeOverlay();
        
        // Show event modal
        showEventModal(event, calendar, isMobile, token);
      });
      
      dayEventsListEl.appendChild(li);
    });
  } else {
    const li = document.createElement('li');
    li.textContent = 'No events for this day';
    dayEventsListEl.appendChild(li);
  }
  
  // Show modal
  createOverlay();
  dayEventsModal.style.display = 'block';
  
  // Set up buttons
  addEventBtn.onclick = null;
  addEventBtn.onclick = function() {
    console.log('Add event button clicked for date:', dateStr);
    dayEventsModal.style.display = 'none';
    removeOverlay();
    
    // Call the create event prompt function after a short delay
    setTimeout(function() {
      createEventPrompt(dateStr, calendar, token);
    }, 50);
  };
  
  closeDayModalBtn.onclick = null;
  closeDayModalBtn.onclick = function() {
    dayEventsModal.style.display = 'none';
    removeOverlay();
  };
  
  // Add ability to close VIEW modal by clicking outside
  const closeDayModalListener = function(e) {
    if (dayEventsModal.style.display === 'block' && 
        !dayEventsModal.contains(e.target) && 
        !e.target.closest('.fc-daygrid-day')) {
      dayEventsModal.style.display = 'none';
      removeOverlay();
      // Remove listener once triggered
      document.removeEventListener('click', closeDayModalListener);
    }
  };
  
  // Add with a delay to prevent immediate triggering
  setTimeout(() => {
    document.addEventListener('click', closeDayModalListener);
  }, 100);
}

// Function to edit an event - EDITING (no outside click closing)
export async function editEvent(event, token, calendar, isMobile) {
  const eventModal = document.getElementById('eventModal');
  if (eventModal) {
    eventModal.style.display = 'none';
  }
  removeOverlay();
  
  // Create a temporary modal for editing
  const editModal = createEditModal(event);
  createOverlay();
  
  // Get references to edit modal elements
  const editTitleInput = document.getElementById('editEventTitle');
  const editDescInput = document.getElementById('editEventDesc');
  const editWhoInput = document.getElementById('editEventWho');
  const editWhenInput = document.getElementById('editEventWhen');
  const saveEditBtn = document.getElementById('saveEditBtn');
  const cancelEditBtn = document.getElementById('cancelEditBtn');
  
  // Apply white-space: pre-wrap to textarea to preserve line breaks
  editDescInput.style.whiteSpace = 'pre-wrap';
  
  // Focus on title
  setTimeout(() => editTitleInput.focus(), 100);
  
  // Set up button handlers
  saveEditBtn.onclick = async function() {
    const newTitle = editTitleInput.value.trim();
    if (!newTitle) {
      showToast('Please enter an event title', 'error');
      return;
    }
    
    const newDesc = editDescInput.value;  // Don't trim() to preserve line breaks
    const newWho = editWhoInput.value.trim();
    const newWhen = editWhenInput.value.trim();
    
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
        body: JSON.stringify({ 
          id: event.id, 
          title: newTitle, 
          description: newDesc,
          who: newWho,
          when: newWhen
        })
      });

      hideLoading();
      removeOverlay();
      
      if (!res.ok) throw new Error('Failed to update');
      
      // Update event in calendar
      event.setProp('title', newTitle);
      event.setExtendedProp('description', newDesc);
      event.setExtendedProp('who', newWho);
      event.setExtendedProp('when', newWhen);
      
      // Update the dots for mobile view
      if (isMobile) {
        updateEventDots(calendar, isMobile);
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
  
  // No outside click handler for edit modal - must use buttons
}

// Function to delete an event - EDITING (no outside click closing)
export async function deleteEvent(event, token, calendar, isMobile) {
  const eventModal = document.getElementById('eventModal');
  if (eventModal) {
    eventModal.style.display = 'none';
  }
  removeOverlay();
  
  // Create a confirmation modal
  const confirmModal = createDeleteModal(event);
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
        updateEventDots(calendar, isMobile);
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
  
  // No outside click handler for delete confirmation - must use buttons
}

// Function to prompt for new event creation - EDITING (no outside click closing)
export function createEventPrompt(dateStr, calendar, token) {
  // Use modal instead of browser prompts
  createOverlay();
  
  console.log('Creating event prompt for date:', dateStr, 'with token?', !!token);
  
  const createEventModal = document.getElementById('createEventModal');
  const newEventTitleInput = document.getElementById('newEventTitle');
  const newEventDescInput = document.getElementById('newEventDesc');
  const newEventWhoInput = document.getElementById('newEventWho');
  const newEventWhenInput = document.getElementById('newEventWhen');
  const saveNewEventBtn = document.getElementById('saveNewEventBtn');
  const cancelNewEventBtn = document.getElementById('cancelNewEventBtn');
  
  if (!createEventModal || !newEventTitleInput || !newEventDescInput || 
      !newEventWhoInput || !newEventWhenInput || !saveNewEventBtn || !cancelNewEventBtn) {
    console.error('Create event modal elements not found!');
    return;
  }
  
  // Store the date for later use
  createEventModal.dataset.date = dateStr;
  
  // Also store the token in a data attribute
  createEventModal.dataset.token = token;
  
  // Clear any previous values
  newEventTitleInput.value = '';
  newEventDescInput.value = '';
  newEventWhoInput.value = '';
  newEventWhenInput.value = '';
  
  // Make sure textarea preserves line breaks
  newEventDescInput.style.whiteSpace = 'pre-wrap';
  
  // Show modal
  createEventModal.style.display = 'block';
  
  // Focus on the title input
  setTimeout(() => newEventTitleInput.focus(), 100);
  
  // Reset any previous onclick handlers
  saveNewEventBtn.onclick = null;
  cancelNewEventBtn.onclick = null;
  
  // Set up button handlers with direct event listeners
  saveNewEventBtn.onclick = function() {
    saveNewEvent(calendar);
  };
  
  cancelNewEventBtn.onclick = function() {
    createEventModal.style.display = 'none';
    removeOverlay();
  };
  
  // No outside click handler for create modal - must use buttons
}

// Function to save the new event
export async function saveNewEvent(calendar) {
  const createEventModal = document.getElementById('createEventModal');
  const newEventTitleInput = document.getElementById('newEventTitle');
  const newEventDescInput = document.getElementById('newEventDesc');
  const newEventWhoInput = document.getElementById('newEventWho');
  const newEventWhenInput = document.getElementById('newEventWhen');
  
  const title = newEventTitleInput.value.trim();
  if (!title) {
    showToast('Please enter an event title', 'error');
    return;
  }
  
  const description = newEventDescInput.value;  // Don't trim() to preserve line breaks
  const who = newEventWhoInput.value.trim();
  const when = newEventWhenInput.value.trim();
  const dateStr = createEventModal.dataset.date;
  
  // Get token from data attribute or from localStorage as fallback
  const token = createEventModal.dataset.token || localStorage.getItem('calendarToken');
  
  if (!token) {
    showToast('Authentication error. Please log in again.', 'error');
    // Redirect to login page
    window.location.href = 'index.html';
    return;
  }
  
  // Debug token to check format
  console.log('Using token for event creation:', token.substring(0, 10) + '...');
  
  // Hide modal
  createEventModal.style.display = 'none';
  
  showLoading('Creating event...');
  
  try {
    console.log('Sending POST request to create event with date:', dateStr);
    
    const res = await fetch('https://nzlrgp5k96.execute-api.us-east-1.amazonaws.com/dev/events', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer ' + token
      },
      body: JSON.stringify({ 
        title, 
        description, 
        time: dateStr,
        who,
        when
      })
    });

    // Check status before trying to parse JSON
    if (!res.ok) {
      const errorText = await res.text();
      throw new Error(`Failed to create event: ${res.status} ${res.statusText} - ${errorText}`);
    }
    
    const data = await res.json();
    console.log('Successful response:', data);
    
    hideLoading();
    removeOverlay();
    
    if (!data.id) throw new Error('No event ID returned from server');

    // Add the event to the calendar
    calendar.addEvent({
      id: data.id,
      title,
      start: dateStr,
      allDay: true,
      extendedProps: { 
        description,
        who,
        when
      }
    });
    
    // Update the dots for mobile view
    const isMobile = window.innerWidth < 768;
    if (isMobile) {
      updateEventDots(calendar, isMobile);
    }
    
    showToast('Event created successfully!', 'success');
  } catch (err) {
    hideLoading();
    removeOverlay();
    console.error('Event creation error:', err);
    
    if (err.message.includes('401')) {
      showToast('Session expired. Please log in again.', 'error');
      // Optional: Redirect to login page after a delay
      setTimeout(() => {
        localStorage.removeItem('calendarToken');
        window.location.href = 'index.html';
      }, 2000);
    } else {
      showToast('Create error: ' + err.message, 'error');
    }
  }
}

// Function to add dots to days with events for mobile view
export function updateEventDots(calendar, isMobile) {
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
