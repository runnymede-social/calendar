// event-handlers.js
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
 */
export function showEventModal(event, calendar, isMobile, token) {
  console.log('showEventModal called for:', event.title);
  removeOverlay();
  document.querySelectorAll('.modal').forEach(m => {
    if (m.style.display === 'block') m.style.display = 'none';
  });

  const eventModal     = document.getElementById('eventModal');
  const modalTitleEl   = document.getElementById('modalTitle');
  const modalDescEl    = document.getElementById('modalDesc');
  const modalWhoEl     = document.getElementById('modalWho');
  const modalContactEl = document.getElementById('modalContact');   // ← new
  const modalWhenEl    = document.getElementById('modalWhen');
  const editBtn        = document.getElementById('editBtn');
  const deleteBtn      = document.getElementById('deleteBtn');
  const closeBtn       = document.getElementById('closeBtn');

  if (!eventModal || !modalTitleEl || !modalDescEl ||
      !modalWhoEl  || !modalContactEl || !modalWhenEl ||
      !editBtn    || !deleteBtn     || !closeBtn) {
    console.error('❌ Modal elements not found!');
    return;
  }

  const savedProps = window.eventPropertiesMap[event.id];
  modalTitleEl.textContent     = event.title;
  modalDescEl.style.whiteSpace = 'pre-wrap';
  modalDescEl.textContent      = event.extendedProps.description || '(No description)';

  if (savedProps) {
    modalWhoEl.innerHTML     = savedProps.who     ? `<strong>Who:</strong> ${savedProps.who}`       : '';
    modalContactEl.innerHTML = savedProps.contact ? `<strong>Contact:</strong> ${savedProps.contact}` : '';  // ← new
    modalWhenEl.innerHTML    = savedProps.when    ? `<strong>When:</strong> ${savedProps.when}`     : '';
  } else {
    modalWhoEl.innerHTML     = event.extendedProps.who     ? `<strong>Who:</strong> ${event.extendedProps.who}`       : '';
    modalContactEl.innerHTML = event.extendedProps.contact ? `<strong>Contact:</strong> ${event.extendedProps.contact}` : '';  // ← new
    modalWhenEl.innerHTML    = event.extendedProps.when    ? `<strong>When:</strong> ${event.extendedProps.when}`     : '';
    if (event.extendedProps.who || event.extendedProps.contact || event.extendedProps.when) {
      window.eventPropertiesMap[event.id] = {
        title:       event.title,
        description: event.extendedProps.description || '',
        who:         event.extendedProps.who         || '',
        contact:     event.extendedProps.contact     || '',  // ← new
        when:        event.extendedProps.when        || ''
      };
    }
  }

  createOverlay();
  eventModal.style.display = 'block';

  // reset handlers
  [editBtn, deleteBtn, closeBtn].forEach(btn => btn.onclick = null);

  editBtn.onclick   = () => editEvent(event, token, calendar, isMobile);
  deleteBtn.onclick = () => deleteEvent(event, token, calendar, isMobile);
  closeBtn.onclick  = () => { eventModal.style.display = 'none'; removeOverlay(); };

  const overlay = document.getElementById('modalOverlay');
  if (overlay) overlay.onclick = e => {
    if (e.target === overlay) {
      eventModal.style.display = 'none';
      removeOverlay();
    }
  };
}

/**
 * VIEW‑ONLY (mobile): Show a list of that day's events.
 */
export function showDayEventsModal(date, dateStr, calendar, isMobile, token) {
  removeOverlay();
  const formattedDate = date.toLocaleDateString('en-US', {
    weekday: 'long', month: 'long', day: 'numeric'
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
  dayEventsListEl.innerHTML   = '';

  const dayEvents = calendar.getEvents().filter(ev =>
    new Date(ev.start).toDateString() === date.toDateString()
  );

  if (dayEvents.length) {
    dayEvents.forEach(ev => {
      const savedProps  = window.eventPropertiesMap[ev.id];
      const description = savedProps ? savedProps.description : ev.extendedProps.description;
      const who         = savedProps ? savedProps.who         : ev.extendedProps.who;
      const contact     = savedProps ? savedProps.contact     : ev.extendedProps.contact;  // ← new
      const when        = savedProps ? savedProps.when        : ev.extendedProps.when;

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
        ${contact  // ← new
          ? `<div class="event-contact"><strong>Contact:</strong> ${contact}</div>`
          : ''
        }
        ${when
          ? `<div class="event-when"><strong>When:</strong> ${when}</div>`
          : ''
        }
      `;
      li.onclick = () => {
        dayEventsModal.style.display = 'none';
        removeOverlay();
        setTimeout(() => showEventModal(ev, calendar, isMobile, token), 50);
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
  addEventBtn.onclick      = () => { dayEventsModal.style.display = 'none'; removeOverlay(); setTimeout(() => createEventPrompt(dateStr, calendar, token), 50); };
  closeDayModalBtn.onclick = () => { dayEventsModal.style.display = 'none'; removeOverlay(); };

  const overlay = document.getElementById('modalOverlay');
  if (overlay) overlay.onclick = e => {
    if (e.target === overlay) {
      dayEventsModal.style.display = 'none';
      removeOverlay();
    }
  };
}

/**
 * EDIT‑MODE: Launch an inline edit modal.
 */
export async function editEvent(event, token, calendar, isMobile) {
  console.log('editEvent function called for:', event.title);
  const eventModal = document.getElementById('eventModal');
  if (eventModal) eventModal.style.display = 'none';
  removeOverlay();
  document.querySelectorAll('#editEventModal').forEach(m => m.remove());

  const savedProps   = window.eventPropertiesMap[event.id];
  const titleValue   = savedProps ? savedProps.title       : event.title;
  const descValue    = savedProps ? savedProps.description : event.extendedProps.description || '';
  const whoValue     = savedProps ? savedProps.who         : event.extendedProps.who        || '';
  const contactValue = savedProps ? savedProps.contact     : event.extendedProps.contact    || '';  // ← new
  const whenValue    = savedProps ? savedProps.when        : event.extendedProps.when       || '';
  console.log('Edit values:', { titleValue, descValue, whoValue, contactValue, whenValue });

  const editModal = createEditModal({
    id: event.id,
    title: titleValue,
    extendedProps: {
      description: descValue,
      who:         whoValue,
      contact:     contactValue,  // ← new
      when:        whenValue
    }
  });
  document.body.appendChild(editModal);
  createOverlay();

  const editTitleInput   = document.getElementById('editEventTitle');
  const editDescInput    = document.getElementById('editEventDesc');
  const editWhoInput     = document.getElementById('editEventWho');
  const editContactInput = document.getElementById('editEventContact');  // ← new
  const editWhenInput    = document.getElementById('editEventWhen');
  const saveEditBtn      = document.getElementById('saveEditBtn');
  const cancelEditBtn    = document.getElementById('cancelEditBtn');

  if (!editTitleInput || !editDescInput || !editWhoInput ||
      !editContactInput || !editWhenInput || !saveEditBtn || !cancelEditBtn) {
    console.error('Edit form elements not found!');
    return;
  }

  editTitleInput.value   = titleValue;
  editDescInput.value    = descValue;
  editWhoInput.value     = whoValue;
  editContactInput.value = contactValue;  // ← new
  editWhenInput.value    = whenValue;
  editDescInput.style.whiteSpace = 'pre-wrap';
  setTimeout(() => editTitleInput.focus(), 100);

  saveEditBtn.onclick   = null;
  cancelEditBtn.onclick = null;

  saveEditBtn.onclick = async () => {
    console.log('Save button clicked');
    const newTitle   = editTitleInput.value.trim();
    if (!newTitle) {
      showToast('Please enter an event title', 'error');
      return;
    }
    const newDesc    = editDescInput.value;
    const newWho     = editWhoInput.value.trim();
    const newContact = editContactInput.value.trim();  // ← new
    const newWhen    = editWhenInput.value.trim();

    editModal.remove();
    showLoading('Updating event…');

    try {
      const res = await fetch(
        'https://nzlrgp5k96.execute-api.us-east-1.amazonaws.com/dev/events',
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization:  'Bearer ' + token
          },
          body: JSON.stringify({
            id:      event.id,
            title:   newTitle,
            description: newDesc,
            who:     newWho,
            contact: newContact,  // ← new
            when:    newWhen
          })
        }
      );
      hideLoading();
      removeOverlay();
      if (!res.ok) throw new Error('Failed to update event');

      window.eventPropertiesMap[event.id] = {
        title:       newTitle,
        description: newDesc,
        who:         newWho,
        contact:     newContact,  // ← new
        when:        newWhen
      };
      event.setProp('title', newTitle);
      event.setExtendedProp('description', newDesc);
      event.setExtendedProp('who', newWho);
      event.setExtendedProp('contact', newContact);  // ← new
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

  cancelEditBtn.onclick = () => {
    document.getElementById('editEventModal')?.remove();
    removeOverlay();
  };

  const overlay = document.getElementById('modalOverlay');
  if (overlay) overlay.onclick = e => {
    if (e.target === overlay) {
      document.getElementById('editEventModal')?.remove();
      removeOverlay();
    }
  };
}

/**
 * EDIT‑MODE: Confirm & delete an event.
 */
export function deleteEvent(event, token, calendar, isMobile) {
  console.log('deleteEvent function called for:', event.title);
  const eventModal = document.getElementById('eventModal');
  if (eventModal) eventModal.style.display = 'none';
  removeOverlay();
  document.querySelectorAll('#confirmDeleteModal').forEach(m => m.remove());

  const confirmModal = createDeleteModal(event);
  document.body.appendChild(confirmModal);
  createOverlay();

  const confirmDeleteBtn = document.getElementById('confirmDeleteBtn');
  const cancelDeleteBtn  = document.getElementById('cancelDeleteBtn');
  const overlay          = document.getElementById('modalOverlay');

  confirmDeleteBtn.onclick = async () => {
    console.log('Confirm delete clicked');
    confirmModal.remove();
    removeOverlay();
    showLoading('Deleting event…');
    try {
      const res = await fetch(
        'https://nzlrgp5k96.execute-api.us-east-1.amazonaws.com/dev/events',
        {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
            Authorization:  'Bearer ' + token
          },
          body: JSON.stringify({ id: event.id })
        }
      );
      hideLoading();
      if (!res.ok) throw new Error(res.status + ' ' + res.statusText);
      delete window.eventPropertiesMap[event.id];
      event.remove();
      if (isMobile) updateEventDots(calendar, isMobile);
      showToast('Event deleted successfully!', 'success');
    } catch (err) {
      console.error('Error deleting event:', err);
      hideLoading();
      showToast('Delete error: ' + err.message, 'error');
    }
  };

  cancelDeleteBtn.onclick = () => {
    confirmModal.remove();
    removeOverlay();
  };

  if (overlay) overlay.onclick = e => {
    if (e.target === overlay) {
      confirmModal.remove();
      removeOverlay();
    }
  };
}

/**
 * EDIT‑MODE: Show modal to create a new event.
 */
export function createEventPrompt(dateStr, calendar, token) {
  console.log('createEventPrompt called for date:', dateStr);
  removeOverlay();
  document.querySelectorAll('#createEventModal').forEach(m => {
    if (m.style.display === 'block') m.style.display = 'none';
  });
  createOverlay();

  const createEventModal     = document.getElementById('createEventModal');
  const newEventTitleInput   = document.getElementById('newEventTitle');
  const newEventDescInput    = document.getElementById('newEventDesc');
  const newEventWhoInput     = document.getElementById('newEventWho');
  const newEventContactInput = document.getElementById('newEventContact');  // ← new
  const newEventWhenInput    = document.getElementById('newEventWhen');
  const saveNewEventBtn      = document.getElementById('saveNewEventBtn');
  const cancelNewEventBtn    = document.getElementById('cancelNewEventBtn');

  if (!createEventModal || !newEventTitleInput || !newEventDescInput ||
      !newEventWhoInput   || !newEventContactInput || !newEventWhenInput ||
      !saveNewEventBtn    || !cancelNewEventBtn) {
    console.error('Create event modal elements not found!');
    return;
  }

  createEventModal.dataset.date  = dateStr;
  createEventModal.dataset.token = token;

  newEventTitleInput.value    = '';
  newEventDescInput.value     = '';
  newEventWhoInput.value      = '';
  newEventContactInput.value  = '';  // ← new
  newEventWhenInput.value     = '';
  newEventDescInput.style.whiteSpace = 'pre-wrap';

  createEventModal.style.display = 'block';
  setTimeout(() => newEventTitleInput.focus(), 100);

  saveNewEventBtn.onclick = () => saveNewEvent(calendar);
  cancelNewEventBtn.onclick = () => {
    createEventModal.style.display = 'none';
    removeOverlay();
  };

  const overlayEl = document.getElementById('modalOverlay');
  if (overlayEl) overlayEl.onclick = e => {
    if (e.target === overlayEl) {
      createEventModal.style.display = 'none';
      removeOverlay();
    }
  };
}

/**
 * EDIT‑MODE: Persist a newly created event to the backend.
 */
export async function saveNewEvent(calendar) {
  console.log('saveNewEvent function called');
  const createEventModal     = document.getElementById('createEventModal');
  const newEventTitleInput   = document.getElementById('newEventTitle');
  const newEventDescInput    = document.getElementById('newEventDesc');
  const newEventWhoInput     = document.getElementById('newEventWho');
  const newEventContactInput = document.getElementById('newEventContact');  // ← new
  const newEventWhenInput    = document.getElementById('newEventWhen');

  const title       = newEventTitleInput.value.trim();
  if (!title) { showToast('Please enter an event title','error'); return; }
  const description = newEventDescInput.value;
  const who         = newEventWhoInput.value.trim();
  const contact     = newEventContactInput.value.trim();  // ← new
  const when        = newEventWhenInput.value.trim();
  const dateStr     = createEventModal.dataset.date;
  const token       = createEventModal.dataset.token || localStorage.getItem('calendarToken');
  if (!token) { showToast('Auth error. Please log in again.','error'); window.location.href='index.html'; return; }

  createEventModal.style.display = 'none';
  showLoading('Creating event…');

  try {
    const res = await fetch(
      'https://nzlrgp5k96.execute-api.us-east-1.amazonaws.com/dev/events',
      {
        method: 'POST',
        headers: {
          'Content-Type':'application/json',
          Authorization: 'Bearer '+token
        },
        body: JSON.stringify({ title, description, time: dateStr, who, contact, when })
      }
    );
    if (!res.ok) {
      const txt = await res.text();
      throw new Error(`Failed to create event: ${res.status} ${res.statusText} - ${txt}`);
    }
    const data = await res.json();
    hideLoading();
    removeOverlay();
    if (!data.id) throw new Error('No event ID returned from server');

    window.eventPropertiesMap[data.id] = { title, description, who, contact, when };  // ← new
    calendar.addEvent({
      id:         data.id,
      title,
      start:      dateStr,
      allDay:     true,
      extendedProps: { description, who, contact, when }  // ← new
    });
    if (window.innerWidth < 768) updateEventDots(calendar, true);
    showToast('Event created successfully!','success');
  } catch (err) {
    console.error('Error creating event:',err);
    hideLoading();
    removeOverlay();
    if (err.message.includes('401')) {
      showToast('Session expired. Log in again.','error');
      setTimeout(()=>{ localStorage.removeItem('calendarToken'); window.location.href='index.html'; },2000);
    } else {
      showToast('Create error: '+err.message,'error');
    }
  }
}

/**
 * For mobile: add dots under days with events.
 */
export function updateEventDots(calendar, isMobile) {
  if (!isMobile) return;
  removeOverlay();
  document.querySelectorAll('.event-dot').forEach(dot=>dot.remove());
  const counts = {};
  calendar.getEvents().forEach(ev=>{
    const d = new Date(ev.start).toISOString().split('T')[0];
    counts[d] = (counts[d]||0)+1;
  });
  document.querySelectorAll('.fc-daygrid-day').forEach(dayEl=>{
    const d = dayEl.getAttribute('data-date');
    if (counts[d]) {
      const cell = dayEl.querySelector('.fc-daygrid-day-bottom');
      if (cell) {
        const dot = document.createElement('div');
        dot.className = 'event-dot event-dot-'+(counts[d]%4);
        cell.appendChild(dot);
      }
    }
  });
}

