// Open your event-handlers.js file and replace only the showDayEventsModal function with this:

export function showDayEventsModal(date, dateStr, calendar, isMobile, token) {
  console.log('Showing day events modal for date:', dateStr);
  
  const formattedDate = date.toLocaleDateString('en-US', { 
    weekday: 'long', 
    month: 'long', 
    day: 'numeric' 
  });
  
  // Get references to modal elements
  const dayEventsModal = document.getElementById('dayEventsModal');
  const dayModalTitleEl = document.getElementById('dayModalTitle');
  const dayEventsListEl = document.getElementById('dayEventsList');
  const addEventBtn = document.getElementById('addEventBtn');
  const closeDayModalBtn = document.getElementById('closeDayModalBtn');
  
  if (!dayModalTitleEl || !dayEventsListEl || !addEventBtn || !closeDayModalBtn || !dayEventsModal) {
    console.error('Required day modal elements not found!');
    return;
  }
  
  dayModalTitleEl.textContent = formattedDate;
  
  // Get events for this day
  const dayEvents = calendar.getEvents().filter(event => {
    const eventStart = new Date(event.start);
    return eventStart.toDateString() === date.toDateString();
  });
  
  // Clear existing list
  dayEventsListEl.innerHTML = '';
  
  // Add events to list
  if (dayEvents.length > 0) {
    dayEvents.forEach(event => {
      const li = document.createElement('li');
      
      // Build HTML with title, description, who, and when
      let html = `<div class="event-title">${event.title}</div>`;
      
      if (event.extendedProps.description) {
        html += `<div class="event-description">${event.extendedProps.description}</div>`;
      }
      
      if (event.extendedProps.who) {
        html += `<div class="event-who"><strong>Who:</strong> ${event.extendedProps.who}</div>`;
      }
      
      if (event.extendedProps.when) {
        html += `<div class="event-when"><strong>When:</strong> ${event.extendedProps.when}</div>`;
      }
      
      li.innerHTML = html;
      
      // Add click handler to open event details
      li.addEventListener('click', function() {
        // Hide day events modal
        dayEventsModal.style.display = 'none';
        removeOverlay();
        
        // Show event modal
        showEventModal(event, calendar, isMobile, token);
      });
      
      dayEventsListEl.appendChild(li);
    });
  } else {
    const li = document.createElement('li');
    li.textContent = 'No events for this day';
    dayEventsListEl.appendChild(li);
  }
  
  // Show modal first
  createOverlay();
  dayEventsModal.style.display = 'block';
  
  // Clean up old event listeners by replacing the elements with clones
  const newAddEventBtn = addEventBtn.cloneNode(true);
  addEventBtn.parentNode.replaceChild(newAddEventBtn, addEventBtn);
  
  const newCloseBtn = closeDayModalBtn.cloneNode(true);
  closeDayModalBtn.parentNode.replaceChild(newCloseBtn, closeDayModalBtn);
  
  // Add event listeners to the new elements
  newAddEventBtn.addEventListener('click', function() {
    console.log('Add event button clicked for date:', dateStr);
    dayEventsModal.style.display = 'none';
    removeOverlay();
    
    // Delay slightly to ensure modal is gone before showing the next one
    setTimeout(() => {
      console.log('Now calling createEventPrompt with date:', dateStr);
      createEventPrompt(dateStr, calendar, token);
    }, 50);
  });
  
  newCloseBtn.addEventListener('click', function() {
    console.log('Close button clicked');
    dayEventsModal.style.display = 'none';
    removeOverlay();
  });
}
