// ✅ Updated calendar.js with view/edit distinction and description support

const token = localStorage.getItem('calendarToken');
if (!token) {
  window.location.href = 'index.html';
}

const calendarEl = document.getElementById('calendar');
const calendar = new FullCalendar.Calendar(calendarEl, {
  initialView: 'dayGridMonth',
  selectable: true,
  editable: false, // We handle editing manually

  // ➕ Add event on date click
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

  // 👁️ View event details
  eventClick: function (info) {
    const event = info.event;
    const desc = event.extendedProps.description || '(No description)';
    const view = confirm(`Title: ${event.title}\nDescription: ${desc}\n\nClick OK to edit, Cancel to close.`);

    if (!view) return;

    const newTitle = prompt('Edit title:', event.title);
    if (newTitle === null) return;
    const newDesc = prompt('Edit description:', desc);
    if (newDesc === null) return;

    fetch('https://nzlrgp5k96.execute-api.us-east-1.amazonaws.com/dev/events', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer ' + token
      },
      body: JSON.stringify({ id: event.id, title: newTitle, description: newDesc })
    })
    .then(res => {
      if (!res.ok) throw new Error('Failed to update');
      event.setProp('title', newTitle);
      event.setExtendedProp('description', newDesc);
    })
    .catch(err => alert('Update error: ' + err.message));
  }
});

// 🧠 Load events from backend
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

