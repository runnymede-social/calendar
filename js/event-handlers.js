// Event Handlers for Calendar Application
// Manages event creation, editing, deletion, and display

import {
  createOverlay,
  removeOverlay,
  showToast,
  showLoading,
  hideLoading,
  createEditModal,
  createDeleteModal
} from './ui-components.js';

// Global map to preserve all event properties
window.eventPropertiesMap = window.eventPropertiesMap || {};

/**
 * VIEW‑ONLY: Show a modal with event details.
 * Best practice: always remove any stray overlays before opening,
 * use addEventListener with `{ once: true }` to avoid duplicate handlers,
 * and clean up outside‑click listeners cleanly.
 */
export function showEventModal(event, calendar, isMobile, token) {
  console.log('showEventModal called for:', event.title);
  
  // 1) Tear down any leftover overlays immediately
  removeOverlay();

  // Reset any existing modal classes to avoid stale styles
  document.querySelectorAll('.modal').forEach(modal => {
    if (modal.style.display === 'block') {
      modal.style.display = 'none';
    }
  });

  const eventModal   = document.getElementById('eventModal');
  const modalTitleEl = document.getElementById('modalTitle');
  const modalDescEl  = document.getElementById('modalDesc');
  const modalWhoEl   = document.getElementById('modalWho');
  const modalWhenEl  = document.getElementById('modalWhen');
  const editBtn      = document.getElementById('editBtn');
  const deleteBtn    = document.getElementById('deleteBtn');
  const closeBtn     = document.getElementById('closeBtn');

  if (!eventModal || !modalTitleEl || !modalDescEl ||
      !modalWhoEl  || !modalWhenEl || !editBtn    ||
      !deleteBtn  || !closeBtn) {
    console.error('❌ Modal elements not found!');
    return;
  }

  // 2) Populate content - First check our persistent map for complete properties
  const savedProps = window.eventPropertiesMap[event.id];
  
  // Basic properties
  modalTitleEl.textContent = event.title;
  modalDescEl.style.whiteSpace = 'pre-wrap';
  modalDescEl.textContent = event.extendedProps.description || '(No description)';

  // Use saved props if available, otherwise fall back to extendedProps
  if (savedProps) {
    console.log(`Using saved properties for event ${event.id}:`, savedProps);
    modalWhoEl.innerHTML = savedProps.who ? `<strong>Who:</strong> ${savedProps.who}` : '';
    modalWhenEl.innerHTML = savedProps.when ? `<strong>When:</strong> ${savedProps.when}` : '';
  } else {
    console.log(`Using extendedProps for event ${event.id}:`, event.extendedProps);
    modalWhoEl.innerHTML = event.extendedProps.who ? `<strong>Who:</strong> ${event.extendedProps.who}` : '';
    modalWhenEl.innerHTML = event.extendedProps.when ? `<strong>When:</strong> ${event.extendedProps.when}` : '';
    
    // If we found properties in extendedProps, save them to our map for future use
    if (event.extendedProps.who || event.extendedProps.when) {
      window.eventPropertiesMap[event.id] = {
        title: event.title,
        description: event.extendedProps.description || '',
        who: event.extendedProps.who || '',
        when: event.extendedProps.when || ''
      };
    }
  }

  // 3) Show overlay + modal
  createOverlay();
  eventModal.style.display = 'block';

  // 4) Remove any existing handlers before adding new ones
  editBtn.onclick = null;
  deleteBtn.onclick = null;
  closeBtn.onclick = null;
  
  // 5) Wire up buttons with direct onclick handlers
  editBtn.onclick = function() {
    console.log('Edit button clicked for:', event.title);
    editEvent(event, token, calendar, isMobile);
  };

  deleteBtn.onclick = function() {
    console.log('Delete button clicked for:', event.title);
    deleteEvent(event, token, calendar, isMobile);
  };

  closeBtn.onclick = function() {
    console.log('Close button clicked');
    eventModal.style.display = 'none';
    removeOverlay();
  };

  // 6) Outside click listener to close VIEW modal
  const overlay = document.getElementById('modalOverlay');
  if (overlay) {
    overlay.onclick = function(e) {
      if (e.target === overlay) {
        console.log('Clicked outside view modal');
        eventModal.style.display = 'none';
        removeOverlay();
      }
    };
  }
}

/**
 * VIEW‑ONLY (mobile): Show a list of that day's events,
 * then allow selecting one to view details.
 */
export function showDayEventsModal(date, dateStr, calendar, isMobile, token) {
  removeOverlay();

  const formattedDate = date.toLocaleDateString('en-US', {
    weekday: 'long',
    month:   'long',
    day:     'numeric'
  });

  const dayEventsModal   = document.getElementById('dayEventsModal');
  const dayModalTitleEl  = document.getElementById('dayModalTitle');
  const dayEventsListEl  = document.getElementById('dayEventsList');
  const addEventBtn      = document.getElementById('addEventBtn');
  const closeDayModalBtn = document.getElementById('closeDayModalBtn');

  if (!dayEventsModal || !dayModalTitleEl || !dayEventsListEl ||
      !addEventBtn   || !closeDayModalBtn) {
    console.error('Required day modal elements not found!');
    return;
  }

  dayModalTitleEl.textContent = formattedDate;

  // Build list of events for that date
  const dayEvents = calendar.getEvents().filter(ev => {
    return new Date(ev.start).toDateString() === date.toDateString();
  });

  dayEventsListEl.innerHTML = '';
  if (dayEvents.length > 0) {
    dayEvents.forEach(ev => {
      // First check our persistent map for complete properties
      const savedProps = window.eventPropertiesMap[ev.id];
      
      // Use either saved properties or extendedProps
      const description = savedProps ? savedProps.description : ev.extendedProps.description;
      const who = savedProps ? savedProps.who : ev.extendedProps.who;
      const when = savedProps ? savedProps.when : ev.extendedProps.when;
      
      const li = document.createElement('li');
      li.innerHTML = `
        <div class="event-title">${ev.title}</div>
        ${description
          ? `<div class="event-description" style="white-space: pre-wrap;">${description}</div>`
          : ''
        }
        ${who
          ? `<div class="event-who"><strong>Who:</strong> ${who}</div>`
          : ''
        }
        ${when
          ? `<div class="event-when"><strong>When:</strong> ${when}</div>`
          : ''
        }
      `;
      // Use direct onclick handler
      li.onclick = function() {
        dayEventsModal.style.display = 'none';
        removeOverlay();
        // Add a small delay before showing the event modal
        setTimeout(() => {
          showEventModal(ev, calendar, isMobile, token);
        }, 50);
      };
      
      dayEventsListEl.appendChild(li);
    });
  } else {
    const li = document.createElement('li');
    li.textContent = 'No events for this day';
    dayEventsListEl.appendChild(li);
  }

  createOverlay();
  dayEventsModal.style.display = 'block';

  // Reset handlers
  addEventBtn.onclick = null;
  closeDayModalBtn.onclick = null;

  // Add new handlers
  addEventBtn.onclick = function() {
    dayEventsModal.style.display = 'none';
    removeOverlay();
    setTimeout(() => createEventPrompt(dateStr, calendar, token), 50);
  };

  closeDayModalBtn.onclick = function() {
    dayEventsModal.style.display = 'none';
    removeOverlay();
  };

  // Handle overlay clicks
  const overlay = document.getElementById('modalOverlay');
  if (overlay) {
    overlay.onclick = function(e) {
      if (e.target === overlay) {
        dayEventsModal.style.display = 'none';
        removeOverlay();
      }
    };
  }
}

/**
 * EDIT‑MODE: Launch an inline edit modal.
 */
export async function editEvent(event, token, calendar, isMobile) {
  console.log('editEvent function called for:', event.title);
  
  // Close any existing view modal/overlay
  const eventModal = document.getElementById('eventModal');
  if (eventModal) {
    eventModal.style.display = 'none';
  }
  
  // Remove any existing overlays and modals
  removeOverlay();
  document.querySelectorAll('#editEventModal').forEach(modal => {
    if (modal && modal.parentNode) {
      modal.parentNode.removeChild(modal);
    }
  });

  // Get the complete properties, either from our map or from the event
  const savedProps = window.eventPropertiesMap[event.id];
  
  // Make sure we have the title
  const titleValue = savedProps ? savedProps.title : event.title;
  const descValue = savedProps ? savedProps.description : event.extendedProps.description || '';
  const whoValue = savedProps ? savedProps.who : event.extendedProps.who || '';
  const whenValue = savedProps ? savedProps.when : event.extendedProps.when || '';
  
  console.log('Edit values:', { titleValue, descValue, whoValue, whenValue });
  
  // Create & show edit modal with the correct properties
  const editModal = createEditModal({
    id: event.id,
    title: titleValue,
    extendedProps: {
      description: descValue,
      who: whoValue,
      when: whenValue
    }
  });
  
  document.body.appendChild(editModal);
  createOverlay();

  // Get references to all form elements AFTER the modal is created and added to DOM
  const editTitleInput = document.getElementById('editEventTitle');
  const editDescInput = document.getElementById('editEventDesc');
  const editWhoInput = document.getElementById('editEventWho');
  const editWhenInput = document.getElementById('editEventWhen');
  const saveEditBtn = document.getElementById('saveEditBtn');
  const cancelEditBtn = document.getElementById('cancelEditBtn');
  
  if (!editTitleInput || !editDescInput || !editWhoInput || 
      !editWhenInput || !saveEditBtn || !cancelEditBtn) {
    console.error('Edit form elements not found!');
    return;
  }
  
  console.log('Edit form elements found:', { 
    editTitleInput, 
    editDescInput, 
    editWhoInput, 
    editWhenInput,
    saveEditBtn,
    cancelEditBtn
  });
  
  // Set the values explicitly
  editTitleInput.value = titleValue;
  editDescInput.value = descValue;
  editWhoInput.value = whoValue;
  editWhenInput.value = whenValue;

  editDescInput.style.whiteSpace = 'pre-wrap';
  setTimeout(() => editTitleInput.focus(), 100);

  // Clear any existing handlers
  saveEditBtn.onclick = null;
  cancelEditBtn.onclick = null;
  
  // Add new handlers
  saveEditBtn.onclick = async function() {
    console.log('Save button clicked');
    const newTitle = editTitleInput.value.trim();
    if (!newTitle) {
      showToast('Please enter an event title', 'error');
      return;
    }
    
    const newDesc = editDescInput.value;
    const newWho = editWhoInput.value.trim();
    const newWhen = editWhenInput.value.trim();
    
    // Clean up the modal
    editModal.style.display = 'none';
    if (editModal.parentNode) {
      document.body.removeChild(editModal);
    }
    
    showLoading('Updating event...');
    
    try {
      const res = await fetch(
        'https://nzlrgp5k96.execute-api.us-east-1.amazonaws.com/dev/events',
        {
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
        }
      );
      
      hideLoading();
      removeOverlay();
      
      if (!res.ok) throw new Error('Failed to update event');
      
      // Update our persistent map with the new values
      window.eventPropertiesMap[event.id] = {
        title: newTitle,
        description: newDesc,
        who: newWho,
        when: newWhen
      };
      
      // Update the calendar event
      event.setProp('title', newTitle);
      event.setExtendedProp('description', newDesc);
      event.setExtendedProp('who', newWho);
      event.setExtendedProp('when', newWhen);
      
      if (isMobile) updateEventDots(calendar, isMobile);
      showToast('Event updated successfully!', 'success');
    } catch (err) {
      console.error('Error updating event:', err);
      hideLoading();
      removeOverlay();
      showToast('Update error: ' + err.message, 'error');
    }
  };
  
  cancelEditBtn.onclick = function() {
    console.log('Cancel button clicked');
    editModal.style.display = 'none';
    if (editModal.parentNode) {
      document.body.removeChild(editModal);
    }
    removeOverlay();
  };
  
  // Handle overlay clicks
  const overlay = document.getElementById('modalOverlay');
  if (overlay) {
    overlay.onclick = function(e) {
      if (e.target === overlay) {
        console.log('Clicked outside edit modal');
        editModal.style.display = 'none';
        if (editModal.parentNode) {
          document.body.removeChild(editModal);
        }
        removeOverlay();
      }
    };
  }
}

/**
 * EDIT‑MODE: Confirm & delete an event.
 */
export async function deleteEvent(event, token, calendar, isMobile) {
  console.log('deleteEvent function called for:', event.title);
  
  // Close any existing view modal
  const eventModal = document.getElementById('eventModal');
  if (eventModal) {
    eventModal.style.display = 'none';
  }
  
  // Remove any existing overlays and modals
  removeOverlay();
  document.querySelectorAll('#confirmDeleteModal').forEach(modal => {
    if (modal && modal.parentNode) {
      modal.parentNode.removeChild(modal);
    }
  });
  
  // Create the delete confirmation modal
  const confirmModal = createDeleteModal(event);
  document.body.appendChild(confirmModal);
  
  // Create overlay
  createOverlay();
  
  // Find the buttons AFTER the modal is added to the DOM
  const confirmDeleteBtn = document.getElementById('confirmDeleteBtn');
  const cancelDeleteBtn = document.getElementById('cancelDeleteBtn');
  
  console.log('Delete modal buttons:', { confirmDeleteBtn, cancelDeleteBtn });
  
  // Return a promise to handle async flow
  return new Promise((resolve) => {
    // Clear any existing handlers
    if (confirmDeleteBtn) confirmDeleteBtn.onclick = null;
    if (cancelDeleteBtn) cancelDeleteBtn.onclick = null;
    
    // Add new handlers
    if (confirmDeleteBtn) {
      confirmDeleteBtn.onclick = async function() {
        console.log('Confirm delete clicked');
        
        // Clean up modal
        if (confirmModal.parentNode) {
          document.body.removeChild(confirmModal);
        }
        removeOverlay();
        
        showLoading('Deleting event...');
        
        try {
          const res = await fetch(
            'https://nzlrgp5k96.execute-api.us-east-1.amazonaws.com/dev/events',
            {
              method: 'DELETE',
              headers: {
                'Content-Type': 'application/json',
                Authorization: 'Bearer ' + token
              },
              body: JSON.stringify({ id: event.id })
            }
          );
          
          hideLoading();
          
          if (!res.ok) throw new Error('Failed to delete event');
          
          // Remove from our persistent map
          delete window.eventPropertiesMap[event.id];
          
          // Remove the event from the calendar
          event.remove();
          
          // Update dots if mobile
          if (isMobile) updateEventDots(calendar, isMobile);
          
          showToast('Event deleted successfully!', 'success');
          resolve(true);
        } catch (err) {
          console.error('Error deleting event:', err);
          hideLoading();
          showToast('Delete error: ' + err.message, 'error');
          resolve(false);
        }
      };
    }
    
    if (cancelDeleteBtn) {
      cancelDeleteBtn.onclick = function() {
        console.log('Cancel delete clicked');
        
        // Clean up modal
        if (confirmModal.parentNode) {
          document.body.removeChild(confirmModal);
        }
        removeOverlay();
        resolve(false);
      };
    }
    
    // Handle overlay clicks
    const overlay = document.getElementById('modalOverlay');
    if (overlay) {
      overlay.onclick = function(e) {
        if (e.target === overlay) {
          console.log('Clicked outside delete modal');
          
          // Clean up modal
          if (confirmModal.parentNode) {
            document.body.removeChild(confirmModal);
          }
          removeOverlay();
          resolve(false);
        }
      };
    }
  });
}

/**
 * EDIT‑MODE: Show modal to create a new event.
 */
export function createEventPrompt(dateStr, calendar, token) {
  console.log('createEventPrompt called for date:', dateStr);
  
  removeOverlay();
  
  // Clean up any existing modals
  document.querySelectorAll('#createEventModal').forEach(modal => {
    if (modal.style.display === 'block') {
      modal.style.display = 'none';
    }
  });
  
  createOverlay();

  const createEventModal   = document.getElementById('createEventModal');
  const newEventTitleInput = document.getElementById('newEventTitle');
  const newEventDescInput  = document.getElementById('newEventDesc');
  const newEventWhoInput   = document.getElementById('newEventWho');
  const newEventWhenInput  = document.getElementById('newEventWhen');
  const saveNewEventBtn    = document.getElementById('saveNewEventBtn');
  const cancelNewEventBtn  = document.getElementById('cancelNewEventBtn');

  if (!createEventModal || !newEventTitleInput || !newEventDescInput ||
      !newEventWhoInput   || !newEventWhenInput || !saveNewEventBtn   ||
      !cancelNewEventBtn) {
    console.error('Create event modal elements not found!');
    return;
  }

  createEventModal.dataset.date  = dateStr;
  createEventModal.dataset.token = token;
  
  // Reset form values
  newEventTitleInput.value = '';
  newEventDescInput.value  = '';
  newEventWhoInput.value   = '';
  newEventWhenInput.value  = '';
  
  newEventDescInput.style.whiteSpace = 'pre-wrap';
  createEventModal.style.display = 'block';
  
  setTimeout(() => newEventTitleInput.focus(), 100);

  // Clear any existing handlers
  saveNewEventBtn.onclick = null;
  cancelNewEventBtn.onclick = null;
  
  // Add new handlers
  saveNewEventBtn.onclick = function() {
    console.log('Save new event button clicked');
    saveNewEvent(calendar);
  };

  cancelNewEventBtn.onclick = function() {
    console.log('Cancel new event button clicked');
    createEventModal.style.display = 'none';
    removeOverlay();
  };
  
  // Handle overlay clicks
  const overlay = document.getElementById('modalOverlay');
  if (overlay) {
    overlay.onclick = function(e) {
      if (e.target === overlay) {
        console.log('Clicked outside create modal');
        createEventModal.style.display = 'none';
        removeOverlay();
      }
    };
  }
}

/**
 * EDIT‑MODE: Persist a newly created event to the backend.
 */
export async function saveNewEvent(calendar) {
  console.log('saveNewEvent function called');
  
  const createEventModal   = document.getElementById('createEventModal');
  const newEventTitleInput = document.getElementById('newEventTitle');
  const newEventDescInput  = document.getElementById('newEventDesc');
  const newEventWhoInput   = document.getElementById('newEventWho');
  const newEventWhenInput  = document.getElementById('newEventWhen');

  const title = newEventTitleInput.value.trim();
  if (!title) {
    showToast('Please enter an event title', 'error');
    return;
  }

  const description = newEventDescInput.value;
  const who         = newEventWhoInput.value.trim();
  const when        = newEventWhenInput.value.trim();
  const dateStr     = createEventModal.dataset.date;
  const token       = createEventModal.dataset.token || localStorage.getItem('calendarToken');

  if (!token) {
    showToast('Authentication error. Please log in again.', 'error');
    window.location.href = 'index.html';
    return;
  }

  createEventModal.style.display = 'none';
  showLoading('Creating event...');

  try {
    const res = await fetch(
      'https://nzlrgp5k96.execute-api.us-east-1.amazonaws.com/dev/events',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization:    'Bearer ' + token
        },
        body: JSON.stringify({
          title,
          description,
          time: dateStr,
          who,
          when
        })
      }
    );

    if (!res.ok) {
      const text = await res.text();
      throw new Error(`Failed to create event: ${res.status} ${res.statusText} - ${text}`);
    }

    const data = await res.json();
    hideLoading();
    removeOverlay();
    
    if (!data.id) throw new Error('No event ID returned from server');
    console.log('Event created successfully with ID:', data.id);

    // Store in our persistent map
    window.eventPropertiesMap[data.id] = {
      title,
      description,
      who,
      when
    };

    // Add the event to the calendar
    calendar.addEvent({
      id:       data.id,
      title,
      start:    dateStr,
      allDay:   true,
      extendedProps: { description, who, when }
    });

    if (window.innerWidth < 768) updateEventDots(calendar, true);
    showToast('Event created successfully!', 'success');
  } catch (err) {
    console.error('Error creating event:', err);
    hideLoading();
    removeOverlay();
    console.error('Event creation error:', err);
    if (err.message.includes('401')) {
      showToast('Session expired. Please log in again.', 'error');
      setTimeout(() => {
        localStorage.removeItem('calendarToken');
        window.location.href = 'index.html';
      }, 2000);
    } else {
      showToast('Create error: ' + err.message, 'error');
    }
  }
}

/**
 * For mobile: add dots under days with events.
 */
export function updateEventDots(calendar, isMobile) {
  if (!isMobile) return;
  removeOverlay(); // no-op in most implementations but safe guard

  // Remove and then rebuild dots
  document.querySelectorAll('.event-dot').forEach(dot => dot.remove());
  const counts = {};
  calendar.getEvents().forEach(ev => {
    const d = new Date(ev.start).toISOString().split('T')[0];
    counts[d] = (counts[d] || 0) + 1;
  });

  document.querySelectorAll('.fc-daygrid-day').forEach(dayEl => {
    const d = dayEl.getAttribute('data-date');
    if (counts[d]) {
      const cell = dayEl.querySelector('.fc-daygrid-day-bottom');
      if (cell) {
        const dot = document.createElement('div');
        dot.className = 'event-dot event-dot-' + (counts[d] % 4);
        cell.appendChild(dot);
      }
    }
  });
}
