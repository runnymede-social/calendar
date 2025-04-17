// Check if user is already authenticated
function isAuthenticated() {
    return localStorage.getItem('calendarToken') !== null;
}

// Redirect to calendar if already authenticated
if (window.location.pathname.endsWith('index.html') && isAuthenticated()) {
    window.location.href = 'calendar.html';
}

// Redirect to login if not authenticated
if (window.location.pathname.endsWith('calendar.html') && !isAuthenticated()) {
    window.location.href = 'index.html';
}

// Handle login form submission
document.addEventListener('DOMContentLoaded', function () {
    // Only initialize login if we're on the login page
    const loginBtn = document.getElementById('login-btn');
    const passwordInput = document.getElementById('password');
    const errorMessage = document.getElementById('error-message');

    if (loginBtn && passwordInput) {
        loginBtn.addEventListener('click', function () {
            const password = passwordInput.value;
            authenticate(password);
        });

        // Allow pressing Enter to submit
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
        const response = await fetch('https://xqj7dxbhge.execute-api.us-east-1.amazonaws.com/dev/auth', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ password })
        });

        const data = await response.json();

        if (response.ok && data.token) {
            // Store the token and redirect
            localStorage.setItem('calendarToken', data.token);
            window.location.href = 'calendar.html';
        } else {
            document.getElementById('error-message').textContent = 'Invalid password. Please try again.';
        }
    } catch (error) {
        console.error('Authentication error:', error);
        document.getElementById('error-message').textContent = 'An error occurred. Please try again later.';
    }
}

// Function to logout
function logout() {
    localStorage.removeItem('calendarToken');
    window.location.href = 'index.html';
}

