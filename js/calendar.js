## js/calendar.js - Calendar Display and Functionality

```javascript
document.addEventListener('DOMContentLoaded', function() {
    // Only initialize calendar if we're on the calendar page
    if (!document.getElementById('calendar')) return;

    // Current date variables
    let currentDate = new Date();
    let currentMonth = currentDate.getMonth();
    let currentYear = currentDate.getFullYear();

    // Initialize calendar
    updateMonthDisplay();
    renderCalendar();
    loadEvents();

    // Event listeners for calendar controls
    document.getElementById('prev-month').addEventListener('click', previousMonth);
    document.getElementById('next-month').addEventListener('click', nextMonth);
    document.getElementById('add-event').addEventListener('click', openEventModal);

    // Modal events
    const modal = document.getElementById('event-modal');
    const closeBtn = document.querySelector('.close');
    const cancelBtn = document.getElementById('cancel-btn');
    
    closeBtn.addEventListener('click', closeEventModal);
    cancelBtn.addEventListener('click', closeEventModal);
    
    // Close modal if clicked outside
    window.addEventListener('click', function(event) {
        if (event.target === modal) {
            closeEventModal();
        }
    });

    // Handle event form submission
    document.getElementById('event-form').addEventListener('submit', function(e) {
        e.preventDefault();
        saveEvent();
    });

    // Functions to navigate months
    function previousMonth() {
        currentMonth--;
        if (currentMonth < 0) {
            currentMonth = 11;
            currentYear--;
        }
        updateMonthDisplay();
        renderCalendar();
        loadEvents();
    }

    function nextMonth() {
        currentMonth++;
        if (currentMonth > 11) {
            currentMonth = 0;
            currentYear++;
        }
        updateMonthDisplay();
        renderCalendar();
        loadEvents();
    }

    // Update the month display
    function updateMonthDisplay() {
        const months = [
            'January', 'February', 'March', 'April', 
            'May', 'June', 'July', 'August', 
            'September', 'October', 'November', 'December'
        ];
        document.getElementById('month-display').textContent = `${months[currentMonth]} ${currentYear}`;
    }

    // Render the calendar grid
    function renderCalendar() {
        const calendarEl = document.getElementById('calendar');
        calendarEl.innerHTML = '';

        // Create header row (days of the week)
        const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        daysOfWeek.forEach(day => {
            const dayEl = document.createElement('div');
            dayEl.className = 'calendar-header';
            dayEl.textContent = day;
            calendarEl.appendChild(dayEl);
        });

        // Get first day of the month and total days
        const firstDayOfMonth = new Date(currentYear, currentMonth, 1).getDay();
        const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
        
        // Get days from previous month
        const daysInPrevMonth = new Date(currentYear, currentMonth, 0).getDate();
        
        // Create the grid cells
        // Previous month's days
        for (let i = 0; i < firstDayOfMonth; i++) {
            const dayEl = document.createElement('div');
            dayEl.className = 'calendar-day inactive';
            const dayNumber = daysInPrevMonth - firstDayOfMonth + i + 1;
            dayEl.innerHTML = `<span class="day-number">${dayNumber}</span><div class="events"></div>`;
            calendarEl.appendChild(dayEl);
        }
        
        // Current month's days
        const today = new Date();
        for (let i = 1; i <= daysInMonth; i++) {
            const dayEl = document.createElement('div');
            dayEl.className = 'calendar-day';
            
            // Check if it's today
            if (currentYear === today.getFullYear() && 
                currentMonth === today.getMonth() && 
                i === today.getDate()) {
                dayEl.classList.add('today');
            }
            
            dayEl.innerHTML = `<span class="day-number">${i}</span><div class="events" data-date="${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}"></div>`;
            
            // Store the date as a data attribute
            dayEl.dataset.date = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`;
            
            // Add event listener to open modal with this date pre-filled
            dayEl.addEventListener('dblclick', function() {
                openEventModal(this.dataset.date);
            });
            
            calendarEl.appendChild(dayEl);
        }
        
        // Next month's days to fill the grid
        const totalCells = 42; // 6 rows of 7 days
        const remainingCells = totalCells - (firstDayOfMonth + daysInMonth);
        
        for (let i = 1; i <= remainingCells; i++) {
            const dayEl = document.createElement('div');
            dayEl.className = 'calendar-day inactive';
            dayEl.innerHTML = `<span class="day-number">${i}</span><div class="events"></div>`;
            calendarEl.appendChild(dayEl);
        }
    }

    // Function to load events from API
    async function loadEvents() {
        try {
            const events = await API.getEvents();
            displayEvents(events);
        } catch (error) {
            console.error('Error loading events:', error);
        }
    }

    // Function to display events on the calendar
    function displayEvents(events) {
        // Clear all existing events
        document.querySelectorAll('.calendar-day .events').forEach(el => {
            el.innerHTML = '';
        });
        
        // Add events to their respective dates
        events.forEach(event => {
            const eventDate = event.date.split('T')[0]; // Get just the date part
            const eventContainer = document.querySelector(`.events[data-date="${eventDate}"]`);
            
            if (eventContainer) {
                const eventEl = document.createElement('div');
                eventEl.className = 'event';
                eventEl.textContent = event.title;
                eventEl.dataset.eventId = event.id;
                
                // Add event details as data attributes for potential tooltips or details view
                eventEl.dataset.title = event.title;
                eventEl.dataset.start = event.startTime;
                eventEl.dataset.end = event.endTime;
                eventEl.dataset.description = event.description || '';
                
                // Add click event to show event details
                eventEl.addEventListener('click', function(e) {
                    e.stopPropagation();
                    showEventDetails(event);
                });
                
                eventContainer.appendChild(eventEl);
            }
        });
    }

    // Function to show event details (can be expanded to show in modal)
    function showEventDetails(event) {
        // For now, just alert the details
        alert(`
            Event: ${event.title}
            Date: ${event.date}
            Time: ${event.startTime} - ${event.endTime}
            ${event.description ? `Description: ${event.description}` : ''}
        `);
        
        // Could be expanded to show in a modal with edit/delete options
    }

    // Modal functions
    function openEventModal(date) {
        const modal = document.getElementById('event-modal');
        const dateInput = document.getElementById('event-date');
        
        // If a date was passed (from clicking on a day), pre-fill it
        if (typeof date === 'string') {
            dateInput.value = date;
        } else {
            // Default to today's date
            const today = new Date();
            dateInput.value = today.toISOString().split('T')[0];
        }
        
        modal.style.display = 'block';
    }

    function closeEventModal() {
        const modal = document.getElementById('event-modal');
        document.getElementById('event-form').reset();
        modal.style.display = 'none';
    }

    // Function to save a new event
    async function saveEvent() {
        const eventData = {
            title: document.getElementById('event-title').value,
            date: document.getElementById('event-date').value,
            startTime: document.getElementById('event-start').value,
            endTime: document.getElementById('event-end').value,
            description: document.getElementById('event-description').value
        };
        
        try {
            await API.createEvent(eventData);
            closeEventModal();
            loadEvents(); // Refresh events display
        } catch (error) {
            console.error('Error saving event:', error);
            alert('An error occurred while saving the event. Please try again.');
        }
    }
});
```
