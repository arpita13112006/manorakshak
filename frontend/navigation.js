// Shared Navigation Script
function setupNavigation() {
    document.querySelectorAll('.nav-item').forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            const tab = item.dataset.tab;
            
            switch(tab) {
                case 'dashboard':
                    window.location.href = 'dashboard.html';
                    break;
                case 'content':
                    window.location.href = 'content.html';
                    break;
                case 'analyse':
                    window.location.href = 'analyse.html';
                    break;
                case 'login':
                    window.location.href = 'login.html';
                    break;
            }
        });
    });
}

// Login page specific logic
function setupLoginPage() {
    // Sign Up button in login footer
    var signupBtn = document.getElementById('openSignupBtn');
    if (signupBtn) {
        signupBtn.addEventListener('click', function() {
            window.location.href = 'signup.html';
        });
    }

    // Login form submission
    var loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', function(e) {
            e.preventDefault();
            alert('Login successful! Redirecting to dashboard...');
            window.location.href = 'dashboard.html';
        });
    }
}

document.addEventListener('DOMContentLoaded', function() {
    setupNavigation();
    setupLoginPage();
});