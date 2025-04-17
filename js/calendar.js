document.addEventListener('DOMContentLoaded', function () {
  const token = localStorage.getItem('calendarToken');
  if (!token) {
    window.location.href = 'index.html';
    return;
  }

  const calendarEl = document.getElementById('calendar');

  // 🛠️ SAFELY ATTACH MODAL TO BODY
  const modal = document.createElement('div');
  modal.id = 'eventModal';
  modal.style.display = 'none';
  modal.style.position = 'fixed'; // Changed from absolute to fixed
  modal.style.zIndex = '1000';
  modal.style.top = '50%';
  modal.style.left = '50%';
  modal.style.transform = 'translate(-50%, -50%)';
  modal.style.background = '#fff';
  modal.style.padding = '1rem';
  modal.style.border = '1px solid #ccc';
  modal.style.borderRadius = '8px';
  modal.style.boxShadow = '0 4px 20px rgba(0,0,0,0.3)'; // Enhanced shadow
  modal.style.minWidth = '300px'; // Ensure modal has minimum width

  modal.innerHTML = `
    <h3 id="modalTitle"></h3>
    <p id="modalDesc"></p>
    <button id="editBtn">Edit</button>
    <button id="closeBtn">Close</button>
  `;

  document.body.appendChild(modal); // ✅ safe and always works

  // Create references to modal elements after appending to DOM
  const modalTitleEl = document.getElementById('modalTitle');
  const modalDescEl = document.getElementById('modalDesc');
  const editBtn = document.getElementById('editBtn');
  const closeBtn = document.getElementById('closeBtn');

  // Add click event to close modal when clicking outside
  document.addEventListener('click', function(event) {
    if (modal.style.display === 'block' && !modal.contains(event.target) && 
        event.target.className !== 'fc-event-title' && 
        !event.target.closest('.fc-event')) {
      modal.style.display = 'none';
      const overlay = document.getElementById('modalOverlay');
      if (overlay) {
        document.body.removeChild(overlay);
      }
    }
  });

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
      console.log('Event clicked:', event.title); // Debug log
      
      // Use the references we created earlier
      if (!modalTitleEl || !modalDescEl) {
        console.error('❌ Modal elements not found!');
        return;
      }

      // Add overlay to make modal more visible
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
      console.log('Setting modal display to block'); // Debug log
      modal.style.display = 'block';

      // Use the button references instead of querying each time
      editBtn.onclick = async () => {
        modal.style.display = 'none';
        const overlay = document.getElementById('modalOverlay');
        if (overlay) {
          document.body.removeChild(overlay);
        }
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
        if (overlay) {
          document.body.removeChild(overlay);
        }
      };
    }
  });

  // 🔄 Load events on page load
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
