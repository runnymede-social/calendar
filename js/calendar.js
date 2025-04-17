// ✅ calendar.js wrapped in an IIFE to avoid global conflicts

(function () {
  const token = localStorage.getItem('calendarToken');
  if (!token) {
    window.location.href = 'index.html';
  }

  const calendarEl = document.getElementById('calendar');
  const modal = document.createElement('div');
  modal.id = 'eventModal';
  modal.style.display = 'none';
  modal.style.position = 'fixed';
  modal.style.top = '50%';
  modal.style.left = '50%';
  modal.style.transform = 'translate(-50%, -50%)';
  modal.style.background = '#fff';
  modal.style.padding = '20px';
  modal.style.boxShadow = '0 0 10px rgba(0,0,0,0.2)';
  modal.style.zIndex = '1000';

  modal.innerHTML = `
    <h3 id="modalTitle"></h3>
    <p id="modalDesc"></p>
    <button id="editBtn">Edit</button>
    <button id="closeBtn">Close</button>
  `;
  document.body.appendChild(modal);

  document.getElementById('closeBtn').onclick = () => modal.style.display = 'none';

  const calendar = new FullCalendar.Calendar(calendarEl, {
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
      const desc = event.extendedProps.description || '(No description)';

      document.getElementById('modalTitle').textContent = event.title;
      document.getElementById('modalDesc').textContent = desc;
      modal.style.display = 'block';

      document.getElementById('editBtn').onclick = async () => {
        modal.style.display = 'none';
        const newTitle = prompt('Edit title:', event.title);
        if (newTitle === null) return;
        const newDesc = prompt('Edit description:', desc);
        if (newDesc === null) return;

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
})();

