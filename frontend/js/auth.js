const API_URL = 'http://localhost:8080/api';

document.addEventListener('DOMContentLoaded', () => {
    // Login Form Handler
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', handleLogin);
    }

    // Signup Form Handler
    const signupForm = document.getElementById('signupForm');
    if (signupForm) {
        signupForm.addEventListener('submit', handleSignup);
    }
});

async function handleLogin(e) {
    e.preventDefault();

    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    const loginText = document.getElementById('loginText');
    const loginSpinner = document.getElementById('loginSpinner');
    const errorAlert = document.getElementById('errorAlert');

    // Show loading state
    loginText.classList.add('d-none');
    loginSpinner.classList.remove('d-none');
    errorAlert.classList.add('d-none');

    try {
        const response = await axios.post(`${API_URL}/auth/login`, {
            username,
            password
        });

        const { token, role, username: user, userId } = response.data;

        // Store user data in memory (not localStorage)
        sessionStorage.setItem('token', token);
        sessionStorage.setItem('role', role);
        sessionStorage.setItem('username', user);
        sessionStorage.setItem('userId', userId);

        // Redirect based on role
        if (role === 'ADMIN') {
            window.location.href = 'admin-dashboard.html';
        } else {
            window.location.href = 'user-dashboard.html';
        }
    } catch (error) {
        loginText.classList.remove('d-none');
        loginSpinner.classList.add('d-none');

        const errorMessage = error.response?.data?.message || 'Invalid credentials. Please try again.';
        showError(errorMessage);
    }
}

async function handleSignup(e) {
    e.preventDefault();

    const username = document.getElementById('username').value;
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const signupText = document.getElementById('signupText');
    const signupSpinner = document.getElementById('signupSpinner');
    const errorAlert = document.getElementById('errorAlert');
    const successAlert = document.getElementById('successAlert');

    // Show loading state
    signupText.classList.add('d-none');
    signupSpinner.classList.remove('d-none');
    errorAlert.classList.add('d-none');
    successAlert.classList.add('d-none');

    try {
        const response = await axios.post(`${API_URL}/auth/register`, {
            username,
            email,
            password
        });

        signupText.classList.remove('d-none');
        signupSpinner.classList.add('d-none');

        successAlert.textContent = 'Registration successful! Redirecting to login...';
        successAlert.classList.remove('d-none');

        // Redirect to login after 2 seconds
        setTimeout(() => {
            window.location.href = 'login.html';
        }, 2000);
    } catch (error) {
        signupText.classList.remove('d-none');
        signupSpinner.classList.add('d-none');

        const errorMessage = error.response?.data?.message || 'Registration failed. Please try again.';
        showError(errorMessage);
    }
}

function showError(message) {
    const errorAlert = document.getElementById('errorAlert');
    if (errorAlert) {
        errorAlert.textContent = message;
        errorAlert.classList.remove('d-none');

        setTimeout(() => {
            errorAlert.classList.add('d-none');
        }, 5000);
    }
}

// Check if user is already logged in
function checkAuth() {
    const token = sessionStorage.getItem('token');
    if (token && (window.location.pathname.includes('login.html') || window.location.pathname.includes('signup.html'))) {
        const role = sessionStorage.getItem('role');
        if (role === 'ADMIN') {
            window.location.href = 'admin-dashboard.html';
        } else {
            window.location.href = 'user-dashboard.html';
        }
    }
}

checkAuth();