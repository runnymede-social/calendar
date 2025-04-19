// Function to show day events modal on mobile
export function showDayEventsModal(date, dateStr, calendar, isMobile, token) {
  const formattedDate = date.toLocaleDateString('en-US', { 
    weekday: 'long', 
    month: 'long', 
    day: 'numeric' 
  });
  
  // Get fresh references to these elements
  const dayModalTitleEl = document.getElementById('dayModalTitle');
  const dayEventsListEl = document.getElementById('dayEventsList');
  const addEventBtn = document.getElementById('addEventBtn');
  const closeDayModalBtn = document.getElementById('closeDayModalBtn');
  const dayEventsModal = document.getElementById('dayEventsModal');
  
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
  
  // Important: Reset the onclick handlers for Add Event button to prevent duplicates
  addEventBtn.onclick = null;
  
  // Set up add event button with direct binding
  addEventBtn.onclick = function() {
    console.log('Add event button clicked for date:', dateStr);
    dayEventsModal.style.display = 'none';
    removeOverlay();
    
    // Call createEventPrompt with this date
    createEventPrompt(dateStr, calendar, token);
  };
  
  // Reset the onclick handler for Close button
  closeDayModalBtn.onclick = null;
  
  // Set up close button
  closeDayModalBtn.onclick = function() {
    dayEventsModal.style.display = 'none';
    removeOverlay();
  };
  
  // Show modal
  createOverlay();
  dayEventsModal.style.display = 'block';
}
