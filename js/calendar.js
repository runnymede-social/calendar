document.addEventListener('DOMContentLoaded', function () {
  const token = localStorage.getItem('calendarToken');
  if (!token) {
    window.location.href = 'index.html';
    return;
  }

  // 🔒 Force FullCalendar to ignore screen size and always use full month view
  window.matchMedia = () => ({
    matches: false,
    addListener: () => {},
    removeListener: () => {}
  });

  const calendarEl = document.getElementById('calendar');

  // Add mobile-specific styles for the calendar
  const style = document.createElement('style');
  style.textContent = `
    @media (max-width: 768px) {
      .fc-view-harness {
        min-height: 500px !important;
      }
      .fc-toolbar {
        flex-direction: column;
        gap: 10px;
      }
      .fc-toolbar-chunk {
        display: flex;
        justify-content: center;
      }
      .fc-col-header-cell-cushion,
      .fc-daygrid-day-number {
        font-size: 0.9rem;
      }
      .fc-daygrid-day-events {
        min-height: 30px;
      }
      .fc-daygrid-event {
        font-size: 0.8rem;
        padding: 2px 4px;
      }
      #eventModal {
        width: 90% !important;
        max-width: 350px;
      }
      #calendar {
        width: 100% !important;
        height: auto !important;
      }
    }
  `;
  document.head.appendChild(style);

  // 🛠️ SAFELY ATTACH MODAL TO BODY
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
    <div style="display: flex; justify-content: space-between; margin-top: 15px;">
      <button id="editBtn">Edit</button>
      <button id="deleteBtn" style="background-color: #ff4d4d; color: white;">Delete</button>
      <button id="closeBtn">Close</button>
    </div>
  `;

  document.body.appendChild(modal);

  const modalTitleEl = document.getElementById('modalTitle');
  const modalDescEl = document.getElementById('modalDesc');
  const editBtn = document.getElementById('editBtn');
  const deleteBtn = document.getElementById('deleteBtn');
  const closeBtn = document.getElementById('closeBtn');

  document.addEventListener('click', function (event) {
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
    initialView: 'dayGridMonth',
    height: 'auto',
    contentHeight: 600, // Ensures minimum height
    aspectRatio: 1.35,  // Controls width-to-height ratio
    expandRows: true,
    selectable: true,
    editable: false,
    eventDisplay: 'block',
    dayMaxEventRows: true,
    views: {
      dayGridMonth: {
        type: 'dayGridMonth',
        dayMaxEventRows: true
      }
    },
    titleFormat: { year: 'numeric', month: 'long' },
    dayCellClassNames: () => ['custom-day-cell'],
    headerToolbar: {
      left: 'title',
      center: '',
      right: 'prev,next'
    },

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

      deleteBtn.onclick = async () => {
        if (confirm('Are you sure you want to delete this event?')) {
          try {
            const res = await fetch('https://nzlrgp5k96.execute-api.us-east-1.amazonaws.com/dev/events', {
              method: 'DELETE',
              headers: {
                'Content-Type': 'application/json',
                Authorization: 'Bearer ' + token
              },
              body: JSON.stringify({ id: event.id })
            });

            if (!res.ok) throw new Error('Failed to delete event');
            
            // Remove event from calendar
            event.remove();
            
            // Close modal
            modal.style.display = 'none';
            const overlay = document.getElementById('modalOverlay');
            if (overlay) {
              document.body.removeChild(overlay);
            }
          } catch (err) {
            alert('Delete error: ' + err.message);
          }
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

  // Handle window resize to force calendar redraw
  window.addEventListener('resize', function() {
    calendar.updateSize();
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
      
      // Force an update after a slight delay to ensure proper rendering
      setTimeout(() => {
        calendar.updateSize();
      }, 100);
    } catch (err) {
      document.getElementById('error').innerText = 'Error loading events: ' + err.message;
    }
  })();
});
