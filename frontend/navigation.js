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

// Initialize navigation when DOM is loaded
document.addEventListener('DOMContentLoaded', setupNavigation);