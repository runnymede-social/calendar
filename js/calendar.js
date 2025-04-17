// ✅ calendar.js wrapped in DOMContentLoaded to ensure modal elements are ready

document.addEventListener('DOMContentLoaded', function () {
  const token = localStorage.getItem('calendarToken');
  if (!token) {
    window.location.href = 'index.html';
  }

  const calendarEl = document.getElementById('calendar');
  const calendarWrapper = document.getElementById('calendar');

  const modal = document.createElement('div');
  modal.id = 'eventModal';
  modal.style.display = 'none';
  modal.style.position = 'absolute';
  modal.style.zIndex = '1000';
  modal.style.top = '50%';
  modal.style.left = '50%';
  modal.style.transform = 'translate(-50%, -50%)';

  modal.innerHTML = `
    <h3 id="modalTitle"></h3>
    <p id="modalDesc"></p>
    <button id="editBtn">Edit</button>
    <button id="closeBtn">Close</button>
  `;
  calendarWrapper.style.position = 'relative';
  calendarWrapper.appendChild(modal);

  const calendar = new FullCalendar.Calendar(calendarEl, {
    titleFormat: { year: 'numeric', month: 'long' },
    dayMaxEventRows: true,
    dayCellClassNames: () => ['custom-day-cell'],
    initialView: 'dayGridMonth',
    selectable: true,
    editable: false,

    dateClick: async function (info) {
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
      const titleEl = modal.querySelector('#modalTitle');
      const descEl = modal.querySelector('#modalDesc');

      if (!titleEl || !descEl) {
        console.error('❌ Modal elements not found!');
        return;
      }

      titleEl.textContent = event.title;
      descEl.textContent = event.extendedProps.description || '(No description)';
      modal.style.display = 'block';

      modal.querySelector('#editBtn').onclick = async () => {
        modal.style.display = 'none';
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

      modal.querySelector('#closeBtn').onclick = () => {
        modal.style.display = 'none';
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

