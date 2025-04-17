document.addEventListener('DOMContentLoaded', async function () {
  const token = localStorage.getItem('calendarToken');
  if (!token) {
    window.location.href = 'index.html';
    return;
  }

  const calendarEl = document.getElementById('calendar');
  const calendar = new FullCalendar.Calendar(calendarEl, {
    initialView: 'dayGridMonth',
    selectable: true,
    editable: true, // Enables drag/drop & resize (if you want)
    eventClick: async function(info) {
      const currentTitle = info.event.title;
      const newTitle = prompt('Edit event title (or leave blank to delete):', currentTitle);

      if (newTitle === null) return; // User hit Cancel

      if (newTitle === '') {
        // 🔥 DELETE
        const confirmed = confirm('Are you sure you want to delete this event?');
        if (!confirmed) return;

        try {
          const res = await fetch('https://nzlrgp5k96.execute-api.us-east-1.amazonaws.com/dev/events', {
            method: 'DELETE',
            headers: {
              'Content-Type': 'application/json',
              Authorization: 'Bearer ' + token
            },
            body: JSON.stringify({ id: info.event.id })
          });

          if (!res.ok) throw new Error('Failed to delete event');
          info.event.remove();
        } catch (err) {
          alert('Delete error: ' + err.message);
        }
      } else if (newTitle !== currentTitle) {
        // ✏️ EDIT
        try {
          const res = await fetch('https://nzlrgp5k96.execute-api.us-east-1.amazonaws.com/dev/events', {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
              Authorization: 'Bearer ' + token
            },
            body: JSON.stringify({
              id: info.event.id,
              title: newTitle
            })
          });

          if (!res.ok) throw new Error('Failed to update event');
          info.event.setProp('title', newTitle);
        } catch (err) {
          alert('Update error: ' + err.message);
        }
      }
    },

    select: async function(info) {
      const title = prompt('Enter event title:');
      if (!title) return;

      const time = info.startStr;

      try {
        const res = await fetch('https://nzlrgp5k96.execute-api.us-east-1.amazonaws.com/dev/events', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: 'Bearer ' + token
          },
          body: JSON.stringify({ title, time })
        });

        const data = await res.json();
        if (!res.ok || !data.id) throw new Error('Failed to create event');

        calendar.addEvent({
          id: data.id,
          title,
          start: time,
          allDay: true
        });
      } catch (err) {
        alert('Create error: ' + err.message);
      }
    }
  });

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
        allDay: true
      });
    });

    calendar.render();
  } catch (err) {
    document.getElementById('error').innerText = 'Error loading events: ' + err.message;
    window.location.href = 'index.html';
  }
});

