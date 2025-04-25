// Auth state management
let currentUser = null;

// DOM Elements
const authModal = document.getElementById('authModal');
const loginForm = document.getElementById('loginForm');
const registerForm = document.getElementById('registerForm');
const forgotPasswordForm = document.getElementById('forgotPasswordForm');
const authTabs = document.querySelectorAll('.auth-tab');
const authForms = document.querySelectorAll('.auth-form');

// Show auth modal
function showAuthModal(tab = 'login') {
    authModal.style.display = 'block';
    switchTab(tab);
}

// Hide auth modal
function hideAuthModal() {
    authModal.style.display = 'none';
}

// Switch between login/register/forgot password forms
function switchTab(tabName) {
    // Update tabs
    authTabs.forEach(tab => {
        tab.classList.toggle('active', tab.dataset.tab === tabName);
    });

    // Update forms
    authForms.forEach(form => {
        form.classList.toggle('active', form.id === `${tabName}Form`);
    });
}

// Handle login
async function handleLogin(e) {
    e.preventDefault();
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;

    try {
        const response = await fetch('/api/auth/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email, password }),
            credentials: 'include' // Important for cookies
        });

        const data = await response.json();

        if (response.ok) {
            currentUser = data.user;
            hideAuthModal();
            updateUIForAuth();
            // Redirect to profile if coming from profile page
            if (window.location.pathname.includes('profile.html') && !currentUser) {
                window.location.href = 'fragments.html';
            }
        } else {
            showError(loginForm, data.message);
        }
    } catch (error) {
        showError(loginForm, 'An error occurred during login');
    }
}

// Handle registration
async function handleRegister(e) {
    e.preventDefault();
    const name = document.getElementById('registerName').value;
    const email = document.getElementById('registerEmail').value;
    const password = document.getElementById('registerPassword').value;

    try {
        const response = await fetch('/api/auth/register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ name, email, password }),
            credentials: 'include'
        });

        const data = await response.json();

        if (response.ok) {
            showSuccess(registerForm, 'Registration successful! Please check your email to verify your account.');
            setTimeout(() => {
                switchTab('login');
            }, 2000);
        } else {
            showError(registerForm, data.message);
        }
    } catch (error) {
        showError(registerForm, 'An error occurred during registration');
    }
}

// Handle forgot password
async function handleForgotPassword(e) {
    e.preventDefault();
    const email = document.getElementById('resetEmail').value;

    try {
        const response = await fetch('/api/auth/forgot-password', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email })
        });

        const data = await response.json();

        if (response.ok) {
            showSuccess(forgotPasswordForm, 'Password reset link sent to your email');
        } else {
            showError(forgotPasswordForm, data.message);
        }
    } catch (error) {
        showError(forgotPasswordForm, 'An error occurred while processing your request');
    }
}

// Show error message
function showError(form, message) {
    let errorDiv = form.querySelector('.error-message');
    if (!errorDiv) {
        errorDiv = document.createElement('div');
        errorDiv.className = 'error-message';
        form.appendChild(errorDiv);
    }
    errorDiv.textContent = message;
    setTimeout(() => {
        errorDiv.remove();
    }, 3000);
}

// Show success message
function showSuccess(form, message) {
    let successDiv = form.querySelector('.success-message');
    if (!successDiv) {
        successDiv = document.createElement('div');
        successDiv.className = 'success-message';
        form.appendChild(successDiv);
    }
    successDiv.textContent = message;
    setTimeout(() => {
        successDiv.remove();
    }, 3000);
}

// Update UI based on authentication state
function updateUIForAuth() {
    const loginButton = document.querySelector('.login-button');
    const userMenu = document.querySelector('.user-menu');
    const profileLink = document.querySelector('.profile-link');

    if (currentUser) {
        if (loginButton) loginButton.style.display = 'none';
        if (userMenu) userMenu.style.display = 'block';
        if (profileLink) profileLink.style.display = 'block';
        // Update user info in menu
        const userName = document.querySelector('.user-name');
        if (userName) userName.textContent = currentUser.name;
    } else {
        if (loginButton) loginButton.style.display = 'block';
        if (userMenu) userMenu.style.display = 'none';
        if (profileLink) profileLink.style.display = 'none';
    }
}

// Event Listeners
document.querySelector('.close')?.addEventListener('click', hideAuthModal);
authTabs.forEach(tab => {
    tab.addEventListener('click', () => switchTab(tab.dataset.tab));
});

document.getElementById('forgotPassword')?.addEventListener('click', () => switchTab('forgotPassword'));
document.getElementById('backToLogin')?.addEventListener('click', () => switchTab('login'));

loginForm?.addEventListener('submit', handleLogin);
registerForm?.addEventListener('submit', handleRegister);
forgotPasswordForm?.addEventListener('submit', handleForgotPassword);

// Check authentication status
async function checkAuthStatus() {
    try {
        const response = await fetch('/api/auth/status', {
            credentials: 'include'
        });
        const data = await response.json();
        
        if (response.ok) {
            currentUser = data.user;
            updateUIForAuth();
            // Redirect to fragments if not authenticated and on profile page
            if (window.location.pathname.includes('profile.html') && !currentUser) {
                window.location.href = 'fragments.html';
            }
        } else {
            currentUser = null;
            updateUIForAuth();
            // Redirect to fragments if on profile page
            if (window.location.pathname.includes('profile.html')) {
                window.location.href = 'fragments.html';
            }
        }
    } catch (error) {
        console.error('Error checking auth status:', error);
        currentUser = null;
        updateUIForAuth();
    }
}

// Initialize
document.addEventListener('DOMContentLoaded', checkAuthStatus);

// Handle logout
async function handleLogout() {
    try {
        const response = await fetch('/api/auth/logout', {
            method: 'POST',
            credentials: 'include'
        });

        if (response.ok) {
            currentUser = null;
            updateUIForAuth();
            // Redirect to fragments page
            window.location.href = 'fragments.html';
        } else {
            showError(document.body, 'Failed to logout');
        }
    } catch (error) {
        console.error('Error during logout:', error);
        showError(document.body, 'An error occurred during logout');
    }
}

// Add loading states
function setLoading(form, isLoading) {
    const submitButton = form.querySelector('.submit-btn');
    if (submitButton) {
        submitButton.disabled = isLoading;
        submitButton.textContent = isLoading ? 'Loading...' : submitButton.dataset.originalText || 'Submit';
    }
}

// Initialize auth state
document.addEventListener('DOMContentLoaded', () => {
    // Set original button text
    document.querySelectorAll('.submit-btn').forEach(button => {
        button.dataset.originalText = button.textContent;
    });

    // Add loading states to forms
    loginForm?.addEventListener('submit', (e) => {
        setLoading(loginForm, true);
        handleLogin(e).finally(() => setLoading(loginForm, false));
    });

    registerForm?.addEventListener('submit', (e) => {
        setLoading(registerForm, true);
        handleRegister(e).finally(() => setLoading(registerForm, false));
    });

    forgotPasswordForm?.addEventListener('submit', (e) => {
        setLoading(forgotPasswordForm, true);
        handleForgotPassword(e).finally(() => setLoading(forgotPasswordForm, false));
    });

    // Check auth status on page load
    checkAuthStatus();
});

// Export functions for use in other modules
window.auth = {
    showAuthModal,
    hideAuthModal,
    handleLogout,
    checkAuthStatus,
    getCurrentUser: () => currentUser
}; 