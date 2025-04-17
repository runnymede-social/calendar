//v2

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
    <div class="modal-buttons">
      <button id="editBtn">Edit</button>
      <button id="closeBtn">Close</button>
    </div>
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
        
        // Create edit dialog
        const editContainer = document.createElement('div');
        editContainer.style.position = 'fixed';
        editContainer.style.zIndex = '1000';
        editContainer.style.top = '50%';
        editContainer.style.left = '50%';
        editContainer.style.transform = 'translate(-50%, -50%)';
        editContainer.style.background = '#fff';
        editContainer.style.padding = '1.5rem';
        editContainer.style.border = '1px solid #ccc';
        editContainer.style.borderRadius = '8px';
        editContainer.style.boxShadow = '0 4px 20px rgba(0,0,0,0.3)';
        editContainer.style.minWidth = '350px';
        
        editContainer.innerHTML = `
          <h3>Edit Event</h3>
          <div style="margin-bottom: 15px;">
            <label for="editTitle" style="display: block; margin-bottom: 5px;">Title:</label>
            <input type="text" id="editTitle" value="${event.title}" style="width: 100%; padding: 8px; box-sizing: border-box;">
          </div>
          <div style="margin-bottom: 15px;">
            <label for="editDesc" style="display: block; margin-bottom: 5px;">Description:</label>
            <textarea id="editDesc" style="width: 100%; padding: 8px; box-sizing: border-box; min-height: 80px;">${event.extendedProps.description || ''}</textarea>
          </div>
          <div style="display: flex; justify-content: space-between;">
            <button id="saveEditBtn" style="padding: 8px 15px; background-color: #4CAF50; color: white; border: none; border-radius: 4px; cursor: pointer;">Save</button>
            <button id="cancelEditBtn" style="padding: 8px 15px; background-color: #f2f2f2; border: none; border-radius: 4px; cursor: pointer;">Cancel</button>
            <button id="deleteEventBtn" style="padding: 8px 15px; background-color: #ff4d4d; color: white; border: none; border-radius: 4px; cursor: pointer;">Delete Event</button>
          </div>
        `;
        
        // Add overlay for edit dialog
        const editOverlay = document.createElement('div');
        editOverlay.style.position = 'fixed';
        editOverlay.style.top = '0';
        editOverlay.style.left = '0';
        editOverlay.style.width = '100%';
        editOverlay.style.height = '100%';
        editOverlay.style.backgroundColor = 'rgba(0,0,0,0.5)';
        editOverlay.style.zIndex = '999';
        
        document.body.appendChild(editOverlay);
        document.body.appendChild(editContainer);
        
        // Focus on title input
        document.getElementById('editTitle').focus();
        
        // Add event listeners for the edit dialog buttons
        document.getElementById('saveEditBtn').addEventListener('click', async () => {
          const newTitle = document.getElementById('editTitle').value;
          const newDesc = document.getElementById('editDesc').value;
          
          if (!newTitle.trim()) {
            alert('Title cannot be empty');
            return;
          }
          
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
            
            // Clean up edit dialog
            document.body.removeChild(editContainer);
            document.body.removeChild(editOverlay);
          } catch (err) {
            alert('Update error: ' + err.message);
          }
        });
        
        document.getElementById('cancelEditBtn').addEventListener('click', () => {
          document.body.removeChild(editContainer);
          document.body.removeChild(editOverlay);
        });
        
        document.getElementById('deleteEventBtn').addEventListener('click', async () => {
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
              
              // Clean up edit dialog
              document.body.removeChild(editContainer);
              document.body.removeChild(editOverlay);
            } catch (err) {
              alert('Delete error: ' + err.message);
            }
          }
        });
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
