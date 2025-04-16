## js/api.js - API Calls to Lambda

```javascript
// API endpoint URLs - replace with your actual API Gateway URL
const API_BASE = 'https://your-api-gateway-url.com';
const API_ENDPOINTS = {
    auth: `${API_BASE}/auth`,
    events: `${API_BASE}/events`
};

// Get auth token from local storage
function getToken() {
    return localStorage.getItem('calendarToken');
}

// Generic function to make authenticated API calls
async function apiCall(endpoint, method = 'GET', data = null) {
    const token = getToken();
    
    if (!token) {
        throw new Error('Not authenticated');
    }
    
    const options = {
        method,
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        }
    };
    
    if (data && (method === 'POST' || method === 'PUT')) {
        options.body = JSON.stringify(data);
    }
    
    const response = await fetch(endpoint, options);
    
    // Handle unauthorized (token expired or invalid)
    if (response.status === 401) {
        localStorage.removeItem('calendarToken');
        window.location.href = 'index.html';
        throw new Error('Session expired');
    }
    
    return response.json();
}

// API functions
const API = {
    // Get all events
    getEvents: async function() {
        return apiCall(API_ENDPOINTS.events);
    },
    
    // Create a new event
    createEvent: async function(eventData) {
        return apiCall(API_ENDPOINTS.events, 'POST', eventData);
    },
    
    // Delete an event
    deleteEvent: async function(eventId) {
        return apiCall(`${API_ENDPOINTS.events}/${eventId}`, 'DELETE');
    }
};
```
