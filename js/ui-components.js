// ui-components.js
// Handles modal creation and management, notifications, and loading indicators

// Create all modals used in the application
export function createAllModals() {
  // Create modal for showing event details
  const modal = document.createElement('div');
  modal.id = 'eventModal';
  modal.style.display = 'none';
  modal.style.position = 'fixed';
  modal.style.zIndex = '1000';
  modal.style.top = '50%';
  modal.style.left = '50%';
  modal.style.transform = 'translate(-50%, -50%)';
  modal.style.background = '#fff';
  modal.style.padding = '1.5rem';
  modal.style.border = '1px solid #ccc';
  modal.style.borderRadius = '12px';
  modal.style.boxShadow = '0 4px 20px rgba(0,0,0,0.3)';
  modal.style.minWidth = '300px';
  
  // Create event creation modal
  const createEventModal = document.createElement('div');
  createEventModal.id = 'createEventModal';
  createEventModal.style.display = 'none';
  createEventModal.style.position = 'fixed';
  createEventModal.style.zIndex = '1000';
  createEventModal.style.top = '50%';
  createEventModal.style.left = '50%';
  createEventModal.style.transform = 'translate(-50%, -50%)';
  createEventModal.style.background = '#fff';
  createEventModal.style.padding = '1.5rem';
  createEventModal.style.border = '1px solid #ccc';
  createEventModal.style.borderRadius = '12px';
  createEventModal.style.boxShadow = '0 4px 20px rgba(0,0,0,0.3)';
  createEventModal.style.minWidth = '300px';
  createEventModal.style.maxWidth = '90%';
  
  // Create day events modal for mobile
  const dayEventsModal = document.createElement('div');
  dayEventsModal.id = 'dayEventsModal';
  dayEventsModal.style.display = 'none';
  dayEventsModal.style.position = 'fixed';
  dayEventsModal.style.zIndex = '1000';
  dayEventsModal.style.top = '50%';
  dayEventsModal.style.left = '50%';
  dayEventsModal.style.transform = 'translate(-50%, -50%)';
  dayEventsModal.style.background = '#fff';
  dayEventsModal.style.padding = '1.5rem';
  dayEventsModal.style.border = '1px solid #ccc';
  dayEventsModal.style.borderRadius = '12px';
  dayEventsModal.style.boxShadow = '0 4px 20px rgba(0,0,0,0.3)';
  dayEventsModal.style.width = '90%';
  dayEventsModal.style.maxWidth = '350px';
  dayEventsModal.style.maxHeight = '80vh';
  dayEventsModal.style.overflow = 'auto';
  
  dayEventsModal.innerHTML = `
    <h3 id="dayModalTitle" style="margin-top: 0; color: #212529;"></h3>
    <ul class="day-events-list" id="dayEventsList"></ul>
    <div style="display: flex; justify-content: space-between; margin-top: 15px;">
      <button id="addEventBtn" class="primary-btn">Add Event</button>
      <button id="closeDayModalBtn" class="default-btn">Close</button>
    </div>
  `;
  
  document.body.appendChild(dayEventsModal);
  
  // Regular event modal content
  modal.innerHTML = `
    <h3 id="modalTitle" style="margin-top: 0; color: #212529;"></h3>
    <p id="modalDesc" style="color: #6c757d;"></p>
    <div id="modalWho"     style="font-size: 0.9rem; color: #6c757d; margin-top: 8px;"></div>
    <div id="modalContact" style="font-size: 0.9rem; color: #6c757d; margin-top: 5px;"></div>  <!-- new -->
    <div id="modalWhen"    style="font-size: 0.9rem; color: #6c757d; margin-top: 5px;"></div>
    <div style="display: flex; justify-content: space-between; margin-top: 15px;">
      <button id="editBtn"   class="primary-btn">Edit</button>
      <button id="deleteBtn" class="danger-btn">Delete</button>
      <button id="closeBtn"  class="default-btn">Close</button>
    </div>
  `;

  // Create event modal content with Who, Contact, and When fields
  createEventModal.innerHTML = `
    <h3 style="margin-top: 0; color: #212529;">Create New Event</h3>
    <div class="form-field">
      <label for="newEventTitle">Event Title:</label>
      <input type="text" id="newEventTitle">
    </div>
    <div class="form-field">
      <label for="newEventDesc">Description:</label>
      <textarea id="newEventDesc" style="min-height: 80px;"></textarea>
    </div>
    <div class="form-field">
      <label for="newEventWho">Who:</label>
      <input type="text" id="newEventWho" placeholder="Who is involved?">
    </div>
    <div class="form-field">
      <label for="newEventContact">Contact:</label>    <!-- new -->
      <input type="text" id="newEventContact" placeholder="Contact info">
    </div>
    <div class="form-field">
      <label for="newEventWhen">When:</label>
      <input type="text" id="newEventWhen" placeholder="Time of day, duration, etc.">
    </div>
    <div style="display: flex; justify-content: space-between; margin-top: 15px;">
      <button id="saveNewEventBtn" class="primary-btn">Save</button>
      <button id="cancelNewEventBtn" class="default-btn">Cancel</button>
    </div>
  `;

  document.body.appendChild(modal);
  document.body.appendChild(createEventModal);
  
  return {
    eventModal: modal,
    createEventModal,
    dayEventsModal
  };
}

// Helper functions for overlay
export function createOverlay() {
  const existingOverlay = document.getElementById('modalOverlay');
  if (existingOverlay) {
    return existingOverlay;
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
  overlay.style.backdropFilter = 'blur(3px)';
  document.body.appendChild(overlay);
  return overlay;
}

export function removeOverlay() {
  const overlay = document.getElementById('modalOverlay');
  if (overlay) {
    document.body.removeChild(overlay);
  }
}

// Creates and manages loading indicator
export function showLoading(message = 'Loading...') {
  const existingLoader = document.getElementById('loadingOverlay');
  if (existingLoader) {
    document.getElementById('loadingText').textContent = message;
    return;
  }
  
  const loadingOverlay = document.createElement('div');
  loadingOverlay.id = 'loadingOverlay';
  loadingOverlay.className = 'loading-overlay';
  
  loadingOverlay.innerHTML = `
    <div class="loading-spinner"></div>
    <div class="loading-text" id="loadingText">${message}</div>
  `;
  
  document.body.appendChild(loadingOverlay);
}

export function hideLoading() {
  const loadingOverlay = document.getElementById('loadingOverlay');
  if (loadingOverlay) {
    document.body.removeChild(loadingOverlay);
  }
}

// Toast notification system
export function showToast(message, type = '', duration = 3000) {
  const existingToast = document.querySelector('.toast');
  if (existingToast) {
    existingToast.remove();
  }
  
  const toast = document.createElement('div');
  toast.className = 'toast ' + type;
  toast.textContent = message;
  document.body.appendChild(toast);
  
  // Trigger CSS animation
  void toast.offsetWidth;
  toast.classList.add('show');
  
  setTimeout(() => {
    toast.classList.remove('show');
    setTimeout(() => {
      if (toast.parentNode) {
        toast.parentNode.removeChild(toast);
      }
    }, 300);
  }, duration);
}

// Create edit modal for an event
export function createEditModal(event) {
  const editModal = document.createElement('div');
  editModal.id = 'editEventModal';
  editModal.style.display = 'block';
  editModal.style.position = 'fixed';
  editModal.style.zIndex = '1000';
  editModal.style.top = '50%';
  editModal.style.left = '50%';
  editModal.style.transform = 'translate(-50%, -50%)';
  editModal.style.background = '#fff';
  editModal.style.padding = '1.5rem';
  editModal.style.border = '1px solid #ccc';
  editModal.style.borderRadius = '12px';
  editModal.style.boxShadow = '0 10px 30px rgba(0,0,0,0.15)';
  editModal.style.minWidth = '300px';
  editModal.style.maxWidth = '90%';
  
  editModal.innerHTML = `
    <h3 style="margin-top: 0; color: #212529;">Edit Event</h3>
    <div class="form-field">
      <label for="editEventTitle">Event Title:</label>
      <input type="text" id="editEventTitle" value="${event.title}">
    </div>
    <div class="form-field">
      <label for="editEventDesc">Description:</label>
      <textarea id="editEventDesc" style="min-height: 80px;">${event.extendedProps.description||''}</textarea>
    </div>
    <div class="form-field">
      <label for="editEventWho">Who:</label>
      <input type="text" id="editEventWho" value="${event.extendedProps.who||''}" placeholder="Who is involved?">
    </div>
    <div class="form-field">
      <label for="editEventContact">Contact:</label>    <!-- new -->
      <input type="text" id="editEventContact" value="${event.extendedProps.contact||''}" placeholder="Contact info">
    </div>
    <div class="form-field">
      <label for="editEventWhen">When:</label>
      <input type="text" id="editEventWhen" value="${event.extendedProps.when||''}" placeholder="Time of day, duration, etc.">
    </div>
    <div style="display: flex; justify-content: space-between; margin-top: 15px;">
      <button id="saveEditBtn"   class="primary-btn">Save</button>
      <button id="cancelEditBtn" class="default-btn">Cancel</button>
    </div>
  `;
  
  document.body.appendChild(editModal);
  return editModal;
}

// Create delete confirmation modal
export function createDeleteModal(event) {
  const confirmModal = document.createElement('div');
  confirmModal.id = 'confirmDeleteModal';
  confirmModal.style.display = 'block';
  confirmModal.style.position = 'fixed';
  confirmModal.style.zIndex = '1000';
  confirmModal.style.top = '50%';
  confirmModal.style.left = '50%';
  confirmModal.style.transform = 'translate(-50%, -50%)';
  confirmModal.style.background = '#fff';
  confirmModal.style.padding = '1.5rem';
  confirmModal.style.border = '1px solid #ccc';
  confirmModal.style.borderRadius = '12px';
  confirmModal.style.boxShadow = '0 10px 30px rgba(0,0,0,0.15)';
  confirmModal.style.minWidth = '300px';
  confirmModal.style.maxWidth = '90%';
  
  confirmModal.innerHTML = `
    <h3 style="margin-top: 0; color: #212529;">Confirm Delete</h3>
    <p>Are you sure you want to delete this event: "${event.title}"?</p>
    <div style="display: flex; justify-content: space-between; margin-top: 15px;">
      <button id="confirmDeleteBtn" class="danger-btn">Delete</button>
      <button id="cancelDeleteBtn"  class="default-btn">Cancel</button>
    </div>
  `;
  
  document.body.appendChild(confirmModal);
  return confirmModal;
}

