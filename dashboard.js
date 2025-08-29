// Dashboard JavaScript - Comprehensive Functionality
class DashboardManager {
    constructor() {
        this.currentUser = 'User';
        this.dailyScore = 0;
        this.trendData = [];
        this.contentBreakdown = {};
        this.alerts = [];
        this.achievements = [];
        this.calmModeEnabled = false;
        
        this.init();
    }

    async init() {
        await this.loadUserData();
        this.setupEventListeners();
        this.initializeCharts();
        this.populateDashboard();
        this.startRealTimeUpdates();
    }

    async loadUserData() {
        try {
            // Load user data from storage
            const userData = await this.getFromStorage(['userData', 'dailyScore', 'trendData', 'contentBreakdown', 'alerts', 'achievements', 'calmModeEnabled']);
            
            this.currentUser = userData.userData?.name || 'User';
            this.dailyScore = userData.dailyScore || this.generateDailyScore();
            this.trendData = userData.trendData || this.generateTrendData();
            this.contentBreakdown = userData.contentBreakdown || this.generateContentBreakdown();
            this.alerts = userData.alerts || this.generateSampleAlerts();
            this.achievements = userData.achievements || this.generateAchievements();
            this.calmModeEnabled = userData.calmModeEnabled || false;
            
        } catch (error) {
            console.log('Using default data:', error);
            this.generateDefaultData();
        }
    }

    generateDefaultData() {
        this.dailyScore = Math.floor(35 + Math.random() * 55);
        this.trendData = this.generateTrendData();
        this.contentBreakdown = this.generateContentBreakdown();
        this.alerts = this.generateSampleAlerts();
        this.achievements = this.generateAchievements();
    }

    generateDailyScore() {
        return Math.floor(35 + Math.random() * 55);
    }

    generateTrendData() {
        const data = [];
        const today = new Date();
        
        for (let i = 6; i >= 0; i--) {
            const date = new Date(today);
            date.setDate(date.getDate() - i);
            
            data.push({
                date: date.toISOString().slice(0, 10),
                score: Math.floor(30 + Math.random() * 60),
                positive: Math.floor(20 + Math.random() * 50),
                negative: Math.floor(10 + Math.random() * 30),
                neutral: Math.floor(5 + Math.random() * 20)
            });
        }
        
        return data;
    }

    generateContentBreakdown() {
        const total = 100;
        const positive = Math.floor(30 + Math.random() * 40);
        const negative = Math.floor(10 + Math.random() * 25);
        const neutral = Math.floor(10 + Math.random() * 20);
        const toxic = total - positive - negative - neutral;
        
        return {
            positive: Math.max(0, positive),
            negative: Math.max(0, negative),
            neutral: Math.max(0, neutral),
            toxic: Math.max(0, toxic)
        };
    }

    generateSampleAlerts() {
        const platforms = ['Instagram', 'YouTube', 'Facebook', 'Twitter'];
        const alertTypes = [
            { type: 'warning', message: '5 sad reels in a row', icon: '⚠️' },
            { type: 'critical', message: '40% content in past 15 mins was toxic', icon: '🚨' },
            { type: 'info', message: 'Great! 80% positive content today', icon: '✅' },
            { type: 'warning', message: 'Negative content detected', icon: '⚠️' }
        ];
        
        const alerts = [];
        const now = new Date();
        
        for (let i = 0; i < 4; i++) {
            const time = new Date(now.getTime() - (i * 2 * 60 * 60 * 1000)); // 2 hours apart
            const platform = platforms[Math.floor(Math.random() * platforms.length)];
            const alertType = alertTypes[Math.floor(Math.random() * alertTypes.length)];
            
            alerts.push({
                id: i + 1,
                platform,
                message: alertType.message,
                type: alertType.type,
                icon: alertType.icon,
                timestamp: time,
                timeAgo: this.getTimeAgo(time)
            });
        }
        
        return alerts;
    }

    generateAchievements() {
        return [
            {
                id: 1,
                title: 'Positive Scroller',
                description: '70%+ positive content today',
                icon: '🌟',
                earned: this.dailyScore >= 70,
                progress: Math.min(100, (this.dailyScore / 70) * 100)
            },
            {
                id: 2,
                title: 'Zen Mode',
                description: 'Enabled Calm Mode 3 times this week',
                icon: '🧘',
                earned: Math.random() > 0.5,
                progress: Math.random() * 100
            },
            {
                id: 3,
                title: 'Toxic-Free Day',
                description: 'No toxic content today',
                icon: '⛔',
                earned: this.contentBreakdown.toxic === 0,
                progress: this.contentBreakdown.toxic === 0 ? 100 : 0
            },
            {
                id: 4,
                title: 'Mindful Breaks',
                description: 'Took 5 mindful breaks today',
                icon: '🌿',
                earned: Math.random() > 0.7,
                progress: Math.random() * 100
            }
        ];
    }

    getTimeAgo(date) {
        const now = new Date();
        const diffMs = now - date;
        const diffMins = Math.floor(diffMs / (1000 * 60));
        const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
        const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
        
        if (diffMins < 60) return `${diffMins} mins ago`;
        if (diffHours < 24) return `${diffHours} hrs ago`;
        return `${diffDays} days ago`;
    }

    setupEventListeners() {
        // Back button
        document.getElementById('backBtn').addEventListener('click', () => {
            if (window.history.length > 1) {
                window.history.back();
            } else {
                window.close();
            }
        });

        // Calm Mode toggle
        const calmToggle = document.getElementById('dashboardCalmToggle');
        calmToggle.checked = this.calmModeEnabled;
        calmToggle.addEventListener('change', (e) => {
            this.calmModeEnabled = e.target.checked;
            this.updateCalmMode();
            this.saveToStorage({ calmModeEnabled: this.calmModeEnabled });
        });

        // Update calm mode display
        this.updateCalmMode();
    }

    updateCalmMode() {
        const suggestions = document.getElementById('calmSuggestions');
        const suggestionsList = [
            { icon: '🌿', text: 'Take a 2 min breathing exercise' },
            { icon: '🎵', text: 'Watch this calming nature reel' },
            { icon: '💡', text: 'Read this uplifting article' },
            { icon: '🧘‍♀️', text: 'Practice 5 minutes of meditation' }
        ];

        if (this.calmModeEnabled) {
            suggestions.classList.add('active');
            suggestions.innerHTML = suggestionsList.map(suggestion => `
                <div class="suggestion-item">
                    <span class="suggestion-icon">${suggestion.icon}</span>
                    <span>${suggestion.text}</span>
                </div>
            `).join('');
        } else {
            suggestions.classList.remove('active');
        }
    }

    initializeCharts() {
        this.initializeTrendChart();
        this.initializeContentPieChart();
    }

    initializeTrendChart() {
        const ctx = document.getElementById('trendChart').getContext('2d');
        
        this.trendChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: this.trendData.map(d => d.date.slice(5)), // Show MM-DD
                datasets: [{
                    label: 'Positivity Score',
                    data: this.trendData.map(d => d.score),
                    borderColor: '#d4a017',
                    backgroundColor: 'rgba(212, 160, 23, 0.1)',
                    borderWidth: 3,
                    fill: true,
                    tension: 0.4,
                    pointBackgroundColor: '#d4a017',
                    pointBorderColor: '#ffffff',
                    pointBorderWidth: 2,
                    pointRadius: 6
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        max: 100,
                        grid: {
                            color: 'rgba(0, 0, 0, 0.1)'
                        },
                        ticks: {
                            color: '#666'
                        }
                    },
                    x: {
                        grid: {
                            color: 'rgba(0, 0, 0, 0.1)'
                        },
                        ticks: {
                            color: '#666'
                        }
                    }
                }
            }
        });
    }

    initializeContentPieChart() {
        const ctx = document.getElementById('contentPieChart').getContext('2d');
        
        this.contentPieChart = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: ['Uplifting', 'Negative', 'Neutral', 'Toxic'],
                datasets: [{
                    data: [
                        this.contentBreakdown.positive,
                        this.contentBreakdown.negative,
                        this.contentBreakdown.neutral,
                        this.contentBreakdown.toxic
                    ],
                    backgroundColor: [
                        '#4caf50',
                        '#f44336',
                        '#ff9800',
                        '#ff5722'
                    ],
                    borderWidth: 0,
                    cutout: '60%'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    }
                }
            }
        });
    }

    populateDashboard() {
        // Update user greeting
        document.getElementById('userGreeting').textContent = `Hi ${this.currentUser} 👋`;
        document.getElementById('dailyStatus').textContent = 
            `Today ${this.dailyScore}% of your feed was positive. ${this.getStatusMessage()}`;

        // Update mood score
        document.getElementById('dashboardPercentText').textContent = `${this.dailyScore}%`;
        document.getElementById('dashboardRingFill').style.setProperty('--p', this.dailyScore);
        
        // Update score breakdown
        document.getElementById('positiveScore').textContent = `${this.contentBreakdown.positive}%`;
        document.getElementById('negativeScore').textContent = `${this.contentBreakdown.negative}%`;

        // Populate alerts
        this.populateAlerts();

        // Populate achievements
        this.populateAchievements();
    }

    getStatusMessage() {
        if (this.dailyScore >= 80) return "Keep it up! 🌞";
        if (this.dailyScore >= 60) return "You're doing great! 🌼";
        if (this.dailyScore >= 40) return "Consider taking a break. 🌿";
        return "Try Calm Mode for a reset. 🧘";
    }

    populateAlerts() {
        const container = document.getElementById('alertsContainer');
        container.innerHTML = this.alerts.map(alert => `
            <div class="alert-item ${alert.type}">
                <div class="alert-time">${alert.icon} On ${alert.platform} ${alert.timeAgo}</div>
                <div class="alert-message">${alert.message}</div>
            </div>
        `).join('');
    }

    populateAchievements() {
        const container = document.getElementById('achievementsContainer');
        container.innerHTML = this.achievements.map(achievement => `
            <div class="achievement-badge ${achievement.earned ? 'earned' : 'locked'}">
                <span class="achievement-icon">${achievement.icon}</span>
                <div class="achievement-title">${achievement.title}</div>
                <div class="achievement-desc">${achievement.description}</div>
                ${achievement.earned ? '<div class="achievement-progress">100%</div>' : 
                  `<div class="achievement-progress">${Math.round(achievement.progress)}%</div>`}
            </div>
        `).join('');
    }

    startRealTimeUpdates() {
        // Simulate real-time updates every 30 seconds
        setInterval(() => {
            this.updateRealTimeData();
        }, 30000);
    }

    updateRealTimeData() {
        // Simulate new alerts
        if (Math.random() > 0.7) {
            this.addNewAlert();
        }
        
        // Update achievements
        this.updateAchievements();
    }

    addNewAlert() {
        const platforms = ['Instagram', 'YouTube', 'Facebook', 'Twitter'];
        const alertTypes = [
            { type: 'warning', message: 'Negative content detected', icon: '⚠️' },
            { type: 'info', message: 'Positive content streak!', icon: '✅' }
        ];
        
        const platform = platforms[Math.floor(Math.random() * platforms.length)];
        const alertType = alertTypes[Math.floor(Math.random() * alertTypes.length)];
        
        const newAlert = {
            id: this.alerts.length + 1,
            platform,
            message: alertType.message,
            type: alertType.type,
            icon: alertType.icon,
            timestamp: new Date(),
            timeAgo: 'Just now'
        };
        
        this.alerts.unshift(newAlert);
        this.alerts = this.alerts.slice(0, 10); // Keep only last 10 alerts
        this.populateAlerts();
        this.saveToStorage({ alerts: this.alerts });
    }

    updateAchievements() {
        // Update achievement progress based on current data
        this.achievements.forEach(achievement => {
            if (achievement.id === 1) { // Positive Scroller
                achievement.earned = this.dailyScore >= 70;
                achievement.progress = Math.min(100, (this.dailyScore / 70) * 100);
            } else if (achievement.id === 3) { // Toxic-Free Day
                achievement.earned = this.contentBreakdown.toxic === 0;
                achievement.progress = this.contentBreakdown.toxic === 0 ? 100 : 0;
            }
        });
        
        this.populateAchievements();
        this.saveToStorage({ achievements: this.achievements });
    }

    async saveToStorage(data) {
        try {
            if (chrome?.storage?.local) {
                await chrome.storage.local.set(data);
            } else {
                // Fallback to localStorage
                Object.keys(data).forEach(key => {
                    localStorage.setItem(key, JSON.stringify(data[key]));
                });
            }
        } catch (error) {
            console.log('Storage save error:', error);
        }
    }

    async getFromStorage(keys) {
        try {
            if (chrome?.storage?.local) {
                return await new Promise((resolve) => {
                    chrome.storage.local.get(keys, resolve);
                });
            } else {
                // Fallback to localStorage
                const result = {};
                keys.forEach(key => {
                    const value = localStorage.getItem(key);
                    if (value) {
                        try {
                            result[key] = JSON.parse(value);
                        } catch {
                            result[key] = value;
                        }
                    }
                });
                return result;
            }
        } catch (error) {
            console.log('Storage get error:', error);
            return {};
        }
    }
}

// Initialize dashboard when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new DashboardManager();
});

// Handle window focus to refresh data
window.addEventListener('focus', () => {
    // Refresh data when user returns to dashboard
    if (window.dashboardManager) {
        window.dashboardManager.loadUserData();
    }
});
