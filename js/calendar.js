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
    headerToolbar: {
      start: 'title',
      center: '',
      end: 'today prev,next'
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

        if (!res.ok) throw new Error('Failed to save event');

        calendar.addEvent({
          title,
          start: time,
          allDay: true
        });
      } catch (err) {
        alert('Error saving event: ' + err.message);
      }
    }
  });

  try {
    const res = await fetch('https://nzlrgp5k96.execute-api.us-east-1.amazonaws.com/dev/events', {
      headers: { Authorization: 'Bearer ' + token }
    });

    if (!res.ok) throw new Error('Unauthorized or expired token');

    const events = await res.json();
    events.forEach(ev => {
      calendar.addEvent({
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

