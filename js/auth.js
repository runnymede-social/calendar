// Check if user is already authenticated
function isAuthenticated() {
  return localStorage.getItem('calendarToken') !== null;
}

// Redirect to calendar if already authenticated
if (window.location.pathname.endsWith('index.html') && isAuthenticated()) {
  window.location.href = 'main.html';
}

// Redirect to login if not authenticated
if (window.location.pathname.endsWith('calendar.html') && !isAuthenticated()) {
  window.location.href = 'index.html';
}

// Handle login form submission
document.addEventListener('DOMContentLoaded', function () {
  const loginBtn = document.getElementById('login-btn');
  const passwordInput = document.getElementById('password');

  if (loginBtn && passwordInput) {
    loginBtn.addEventListener('click', () => {
      const password = passwordInput.value;
      authenticate(password);
    });

    passwordInput.addEventListener('keyup', function (event) {
      if (event.key === 'Enter') {
        const password = passwordInput.value;
        authenticate(password);
      }
    });
  }
});

// Authenticate with the API
async function authenticate(password) {
  try {
    const response = await fetch('https://nzlrgp5k96.execute-api.us-east-1.amazonaws.com/dev/auth', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ password })
    });

    let data = await response.json();

    // Handle double-stringified response from AWS
    if (typeof data === 'string') {
      data = JSON.parse(data);
    }

    if (response.ok && data.token) {
      localStorage.setItem('calendarToken', data.token);
      window.location.href = 'calendar.html';
    } else {
      document.getElementById('error-message').textContent = data.message || 'Invalid password. Please try again.';
    }
  } catch (error) {
    console.error('Authentication error:', error);
    document.getElementById('error-message').textContent = 'An error occurred. Please try again later.';
  }
}

// Logout function (if needed elsewhere)
function logout() {
  localStorage.removeItem('calendarToken');
  window.location.href = 'index.html';
}

