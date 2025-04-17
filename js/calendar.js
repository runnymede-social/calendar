document.addEventListener('DOMContentLoaded', () => {
  const token = localStorage.getItem('calendarToken');
  if (!token) {
    window.location.href = 'index.html';
    return;
  }

  const Calendar = tui.Calendar;
  const calendar = new Calendar('#calendar', {
    defaultView: 'month',
    useCreationPopup: true,
    useDetailPopup: true
  });

  // Fetch events
  fetch('https://nzlrgp5k96.execute-api.us-east-1.amazonaws.com/dev/events', {
    headers: { Authorization: 'Bearer ' + token }
  })
  .then(res => {
    if (!res.ok) throw new Error('Unauthorized or expired token');
    return res.json();
  })
  .then(events => {
    events.forEach(ev => {
      calendar.createSchedules([{
        id: ev.id || String(Date.now() + Math.random()),
        title: ev.title,
        start: ev.time,
        end: ev.time,
        category: 'time'
      }]);
    });
  })
  .catch(err => {
    alert('Error loading events: ' + err.message);
    window.location.href = 'index.html';
  });

  // Create new event
  calendar.on('beforeCreateSchedule', function(event) {
    const { start, title } = event;
    const time = start._date.toISOString();

    fetch('https://nzlrgp5k96.execute-api.us-east-1.amazonaws.com/dev/events', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer ' + token
      },
      body: JSON.stringify({ title, time })
    })
    .then(res => {
      if (!res.ok) throw new Error('Failed to save event');
      return res.json();
    })
    .then(() => {
      calendar.createSchedules([{
        id: String(Date.now() + Math.random()),
        title,
        start: time,
        end: time,
        category: 'time'
      }]);
    })
    .catch(err => {
      alert(err.message);
    });
  });
});

