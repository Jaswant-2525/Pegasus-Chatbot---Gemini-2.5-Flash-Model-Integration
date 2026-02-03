// Helper: Get CSRF Token (Security requirement for Django)
function getCookie(name) {
    let cookieValue = null;
    if (document.cookie && document.cookie !== '') {
        const cookies = document.cookie.split(';');
        for (let i = 0; i < cookies.length; i++) {
            const cookie = cookies[i].trim();
            if (cookie.substring(0, name.length + 1) === (name + '=')) {
                cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                break;
            }
        }
    }
    return cookieValue;
}

// Toggle Forms
function switchForm(formType) {
    const loginBtn = document.getElementById('loginBtn');
    const signupBtn = document.getElementById('signupBtn');
    const loginForm = document.getElementById('loginForm');
    const signupForm = document.getElementById('signupForm');

    document.querySelectorAll('.error-msg').forEach(el => el.textContent = '');
    document.querySelectorAll('.input-group').forEach(el => el.classList.remove('error'));

    if (formType === 'signup') {
        loginBtn.classList.remove('active');
        signupBtn.classList.add('active');
        loginForm.classList.remove('active-form');
        setTimeout(() => signupForm.classList.add('active-form'), 50); 
    } else {
        signupBtn.classList.remove('active');
        loginBtn.classList.add('active');
        signupForm.classList.remove('active-form');
        setTimeout(() => loginForm.classList.add('active-form'), 50);
    }
}

// Validation Helpers
function isValidEmail(email) { return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email); }
function showError(elementId, message) {
    const errorSpan = document.getElementById(elementId);
    errorSpan.textContent = message;
    errorSpan.parentElement.classList.add('error');
}
function clearError(elementId) {
    const errorSpan = document.getElementById(elementId);
    errorSpan.textContent = '';
    errorSpan.parentElement.classList.remove('error');
}

// --- REAL LOGIN LOGIC ---
function handleLogin(e) {
    e.preventDefault();
    const email = document.getElementById('loginEmail').value;
    const pass = document.getElementById('loginPass').value;
    const btn = e.target.querySelector('.submit-btn');
    
    clearError('loginEmailError');
    clearError('loginPassError');

    if (!isValidEmail(email)) {
        showError('loginEmailError', 'Invalid email address');
        return;
    }
    if (!pass) {
        showError('loginPassError', 'Password required');
        return;
    }

    // Loading State
    const originalText = btn.innerHTML;
    btn.innerHTML = 'Verifying...';
    btn.disabled = true;

    // Send to Django
    fetch('/api/login/', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-CSRFToken': getCookie('csrftoken')
        },
        body: JSON.stringify({ email: email, password: pass })
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            window.location.href = '/chat/';
        } else {
            showError('loginPassError', data.error); // Show Database Error
            btn.innerHTML = originalText;
            btn.disabled = false;
        }
    })
    .catch(error => {
        console.error('Error:', error);
        showError('loginPassError', 'Server connection failed');
        btn.innerHTML = originalText;
        btn.disabled = false;
    });
}

// --- REAL SIGNUP LOGIC ---
function handleSignup(e) {
    e.preventDefault();
    const name = document.getElementById('regName').value;
    const email = document.getElementById('regEmail').value;
    const pass = document.getElementById('regPass').value;
    const confirmPass = document.getElementById('regConfirmPass').value;
    const btn = e.target.querySelector('.submit-btn');

    clearError('regEmailError');
    clearError('regPassError');

    if (!isValidEmail(email)) { showError('regEmailError', 'Invalid email'); return; }
    if (pass.length < 8) { showError('regPassError', 'Min 8 chars required'); return; }
    if (pass !== confirmPass) { showError('regPassError', 'Passwords do not match'); return; }

    btn.innerHTML = 'Creating...';
    btn.disabled = true;

    fetch('/api/signup/', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-CSRFToken': getCookie('csrftoken')
        },
        body: JSON.stringify({ name: name, email: email, password: pass })
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            alert("Account created!");
            window.location.href = '/'; // Go to Home after signup
        } else {
            showError('regEmailError', data.error); // Show Database Error (e.g., Email exists)
            btn.innerHTML = 'Create Account';
            btn.disabled = false;
        }
    })
    .catch(error => {
        console.error('Error:', error);
        btn.innerHTML = 'Create Account';
        btn.disabled = false;
    });
}