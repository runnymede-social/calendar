document.addEventListener('DOMContentLoaded', function () {
  const token = localStorage.getItem('calendarToken');
  if (!token) {
    window.location.href = 'index.html';
    return;
  }

  const isMobile = window.innerWidth <= 768;
  const calendarEl = document.getElementById('calendar');

  // Modal setup
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

  modal.innerHTML = `
    <h3 id="modalTitle"></h3>
    <p id="modalDesc"></p>
    <button id="editBtn">Edit</button>
    <button id="closeBtn">Close</button>
  `;
  document.body.appendChild(modal);

  const modalTitleEl = document.getElementById('modalTitle');
  const modalDescEl = document.getElementById('modalDesc');
  const editBtn = document.getElementById('editBtn');
  const closeBtn = document.getElementById('closeBtn');

  document.addEventListener('click', function (event) {
    if (modal.style.display === 'block' && !modal.contains(event.target) &&
        event.target.className !== 'fc-event-title' &&
        !event.target.closest('.fc-event')) {
      modal.style.display = 'none';
      const overlay = document.getElementById('modalOverlay');
      if (overlay) document.body.removeChild(overlay);
    }
  });

  const calendar = new FullCalendar.Calendar(calendarEl, {
    initialView: isMobile ? 'dayGridDay' : 'dayGridMonth',
    dayMaxEventRows: !isMobile,
    selectable: true,
    editable: false,
    eventDisplay: 'block',
    titleFormat: { year: 'numeric', month: 'long' },
    dayCellClassNames: () => ['custom-day-cell'],

    dateClick: async function (info) {
      if (isMobile) {
        calendar.changeView('dayGridDay', info.dateStr);
        return;
      }

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
          body: JSON.stringify({ title, description, time: info.dateStr })
        });

        const data = await res.json();
        if (!res.ok || !data.id) throw new Error('Failed to create event');

        calendar.addEvent({
          id: data.id,
          title,
          start: info.dateStr,
          allDay: true,
          extendedProps: { description }
        });
      } catch (err) {
        alert('Create error: ' + err.message);
      }
    },

    eventClick: function (info) {
      const event = info.event;

      if (!modalTitleEl || !modalDescEl) {
        console.error('❌ Modal elements not found!');
        return;
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

      modalTitleEl.textContent = event.title;
      modalDescEl.textContent = event.extendedProps.description || '(No description)';
      modal.style.display = 'block';

      editBtn.onclick = async () => {
        modal.style.display = 'none';
        const overlay = document.getElementById('modalOverlay');
        if (overlay) document.body.removeChild(overlay);
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
        } catch (err) {
          alert('Update error: ' + err.message);
        }
      };

      closeBtn.onclick = () => {
        modal.style.display = 'none';
        const overlay = document.getElementById('modalOverlay');
        if (overlay) document.body.removeChild(overlay);
      };
    }
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
    } catch (err) {
      document.getElementById('error').innerText = 'Error loading events: ' + err.message;
    }
  })();
});

