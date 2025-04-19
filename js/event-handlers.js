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

/**
 * VIEW‑ONLY: Show a modal with event details.
 * Best practice: always remove any stray overlays before opening,
 * use addEventListener with `{ once: true }` to avoid duplicate handlers,
 * and clean up outside‑click listeners cleanly.
 */
export function showEventModal(event, calendar, isMobile, token) {
  // 1) Tear down any leftover overlays immediately
  removeOverlay();

  const eventModal   = document.getElementById('eventModal');
  const modalTitleEl = document.getElementById('modalTitle');
  const modalDescEl  = document.getElementById('modalDesc');
  const modalWhoEl   = document.getElementById('modalWho');
  const modalWhenEl  = document.getElementById('modalWhen');
  const editBtn      = document.getElementById('editBtn');
  const deleteBtn    = document.getElementById('deleteBtn');
  const closeBtn     = document.getElementById('closeBtn');

  if (!eventModal || !modalTitleEl || !modalDescEl ||
      !modalWhoEl  || !modalWhenEl   || !editBtn    ||
      !deleteBtn  || !closeBtn) {
    console.error('❌ Modal elements not found!');
    return;
  }

  // 2) Populate content
  modalTitleEl.textContent = event.title;
  modalDescEl.style.whiteSpace = 'pre-wrap';
  modalDescEl.textContent = event.extendedProps.description || '(No description)';
  modalWhoEl.innerHTML  = event.extendedProps.who  ? `<strong>Who:</strong> ${event.extendedProps.who}`   : '';
  modalWhenEl.innerHTML = event.extendedProps.when ? `<strong>When:</strong> ${event.extendedProps.when}` : '';

  // 3) Show overlay + modal
  createOverlay();
  eventModal.style.display = 'block';

  // 4) Wire up buttons, once-only to avoid duplicates
  editBtn.addEventListener('click', () => {
    editEvent(event, token, calendar, isMobile);
  }, { once: true });

  deleteBtn.addEventListener('click', () => {
    deleteEvent(event, token, calendar, isMobile);
  }, { once: true });

  closeBtn.addEventListener('click', () => {
    eventModal.style.display = 'none';
    removeOverlay();
    document.removeEventListener('click', outsideClickHandler);
  }, { once: true });

  // 5) Outside click listener to close VIEW modal
  const outsideClickHandler = e => {
    if (eventModal.style.display === 'block' &&
        !eventModal.contains(e.target) &&
        !e.target.closest('.day-events-list li')) {
      eventModal.style.display = 'none';
      removeOverlay();
      document.removeEventListener('click', outsideClickHandler);
    }
  };
  // Delay adding to avoid immediate trigger
  setTimeout(() => {
    document.addEventListener('click', outsideClickHandler, { once: true });
  }, 100);
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
      const li = document.createElement('li');
      li.innerHTML = `
        <div class="event-title">${ev.title}</div>
        ${ev.extendedProps.description
          ? `<div class="event-description" style="white-space: pre-wrap;">${ev.extendedProps.description}</div>`
          : ''
        }
        ${ev.extendedProps.who
          ? `<div class="event-who"><strong>Who:</strong> ${ev.extendedProps.who}</div>`
          : ''
        }
        ${ev.extendedProps.when
          ? `<div class="event-when"><strong>When:</strong> ${ev.extendedProps.when}</div>`
          : ''
        }
      `;
      // Once-only click to drill in
      li.addEventListener('click', () => {
        dayEventsModal.style.display = 'none';
        removeOverlay();
        showEventModal(ev, calendar, isMobile, token);
      }, { once: true });
      dayEventsListEl.appendChild(li);
    });
  } else {
    const li = document.createElement('li');
    li.textContent = 'No events for this day';
    dayEventsListEl.appendChild(li);
  }

  createOverlay();
  dayEventsModal.style.display = 'block';

  addEventBtn.addEventListener('click', () => {
    dayEventsModal.style.display = 'none';
    removeOverlay();
    setTimeout(() => createEventPrompt(dateStr, calendar, token), 50);
  }, { once: true });

  closeDayModalBtn.addEventListener('click', () => {
    dayEventsModal.style.display = 'none';
    removeOverlay();
  }, { once: true });

  const outsideClickHandler = e => {
    if (dayEventsModal.style.display === 'block' &&
        !dayEventsModal.contains(e.target) &&
        !e.target.closest('.fc-daygrid-day')) {
      dayEventsModal.style.display = 'none';
      removeOverlay();
      document.removeEventListener('click', outsideClickHandler);
    }
  };
  setTimeout(() => {
    document.addEventListener('click', outsideClickHandler, { once: true });
  }, 100);
}

/**
 * EDIT‑MODE: Launch an inline edit modal.
 */
export async function editEvent(event, token, calendar, isMobile) {
  // Close any existing view modal/overlay
  const eventModal = document.getElementById('eventModal');
  if (eventModal) {
    eventModal.style.display = 'none';
  }
  removeOverlay();

  // Create & show edit modal
  const editModal = createEditModal(event);
  createOverlay();

  const editTitleInput  = document.getElementById('editEventTitle');
  const editDescInput   = document.getElementById('editEventDesc');
  const editWhoInput    = document.getElementById('editEventWho');
  const editWhenInput   = document.getElementById('editEventWhen');
  const saveEditBtn     = document.getElementById('saveEditBtn');
  const cancelEditBtn   = document.getElementById('cancelEditBtn');

  editDescInput.style.whiteSpace = 'pre-wrap';
  setTimeout(() => editTitleInput.focus(), 100);

  saveEditBtn.addEventListener('click', async () => {
    const newTitle = editTitleInput.value.trim();
    if (!newTitle) {
      showToast('Please enter an event title', 'error');
      return;
    }
    const newDesc = editDescInput.value;
    const newWho  = editWhoInput.value.trim();
    const newWhen = editWhenInput.value.trim();

    editModal.style.display = 'none';
    document.body.removeChild(editModal);
    showLoading('Updating event...');

    try {
      const res = await fetch(
        'https://nzlrgp5k96.execute-api.us-east-1.amazonaws.com/dev/events',
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization:    'Bearer ' + token
          },
          body: JSON.stringify({
            id:          event.id,
            title:       newTitle,
            description: newDesc,
            who:         newWho,
            when:        newWhen
          })
        }
      );
      hideLoading();
      removeOverlay();

      if (!res.ok) throw new Error('Failed to update');

      event.setProp('title', newTitle);
      event.setExtendedProp('description', newDesc);
      event.setExtendedProp('who', newWho);
      event.setExtendedProp('when', newWhen);

      if (isMobile) updateEventDots(calendar, isMobile);
      showToast('Event updated successfully!', 'success');
    } catch (err) {
      hideLoading();
      removeOverlay();
      showToast('Update error: ' + err.message, 'error');
    }
  }, { once: true });

  cancelEditBtn.addEventListener('click', () => {
    editModal.style.display = 'none';
    document.body.removeChild(editModal);
    removeOverlay();
  }, { once: true });
}

/**
 * EDIT‑MODE: Confirm & delete an event.
 */
export async function deleteEvent(event, token, calendar, isMobile) {
  const eventModal = document.getElementById('eventModal');
  if (eventModal) {
    eventModal.style.display = 'none';
  }
  removeOverlay();

  const confirmModal    = createDeleteModal(event);
  createOverlay();
  const confirmDeleteBtn = document.getElementById('confirmDeleteBtn');
  const cancelDeleteBtn  = document.getElementById('cancelDeleteBtn');

  confirmDeleteBtn.addEventListener('click', async () => {
    confirmModal.style.display = 'none';
    document.body.removeChild(confirmModal);
    showLoading('Deleting event...');
    try {
      const res = await fetch(
        'https://nzlrgp5k96.execute-api.us-east-1.amazonaws.com/dev/events',
        {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
            Authorization:    'Bearer ' + token
          },
          body: JSON.stringify({ id: event.id })
        }
      );
      hideLoading();
      removeOverlay();

      if (!res.ok) throw new Error('Failed to delete event');
      event.remove();
      if (isMobile) updateEventDots(calendar, isMobile);
      showToast('Event deleted successfully!', 'success');
    } catch (err) {
      hideLoading();
      removeOverlay();
      showToast('Delete error: ' + err.message, 'error');
    }
  }, { once: true });

  cancelDeleteBtn.addEventListener('click', () => {
    confirmModal.style.display = 'none';
    document.body.removeChild(confirmModal);
    removeOverlay();
  }, { once: true });
}

/**
 * EDIT‑MODE: Show modal to create a new event.
 */
export function createEventPrompt(dateStr, calendar, token) {
  removeOverlay();
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
  newEventTitleInput.value = '';
  newEventDescInput.value  = '';
  newEventWhoInput.value   = '';
  newEventWhenInput.value  = '';
  newEventDescInput.style.whiteSpace = 'pre-wrap';
  createEventModal.style.display = 'block';
  setTimeout(() => newEventTitleInput.focus(), 100);

  saveNewEventBtn.addEventListener('click', () => {
    saveNewEvent(calendar);
  }, { once: true });

  cancelNewEventBtn.addEventListener('click', () => {
    createEventModal.style.display = 'none';
    removeOverlay();
  }, { once: true });
}

/**
 * EDIT‑MODE: Persist a newly created event to the backend.
 */
export async function saveNewEvent(calendar) {
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

