document.addEventListener('DOMContentLoaded', function () {
  const loginBtn = document.getElementById('login-btn');
  const passwordInput = document.getElementById('password');
  const errorMsg = document.getElementById('error-message');

  loginBtn.addEventListener('click', async () => {
    const password = passwordInput.value;

    const res = await fetch('https://nzlrgp5k96.execute-api.us-east-1.amazonaws.com/dev/auth', {

      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password })
    });

    const data = await res.json();

    if (res.ok && data.token) {
      localStorage.setItem('calendarToken', data.token);
      window.location.href = 'calendar.html';
    } else {
      errorMsg.textContent = data.message || 'Login failed';
    }
  });
});

