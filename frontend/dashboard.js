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
            { icon: '🧘♀️', text: 'Practice 5 minutes of meditation' }
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
                        }
                    },
                    x: {
                        grid: {
                            color: 'rgba(0, 0, 0, 0.1)'
                        }
                    }
                }
            }
        });
    }

    initializeContentPieChart() {
        const ctx = document.getElementById('contentPieChart').getContext('2d');
        
        this.contentChart = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: ['Positive', 'Negative', 'Neutral', 'Toxic'],
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
                    borderWidth: 2,
                    borderColor: '#ffffff'
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
        
        // Update daily status
        const statusText = this.dailyScore >= 70 ? 
            'You\'re having a great day! Keep it up! 🌟' :
            this.dailyScore >= 50 ?
            'Your day is going well. Stay mindful! 🌼' :
            'Take some time for self-care today 🌿';
        document.getElementById('dailyStatus').textContent = statusText;

        // Update score displays
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

    populateAlerts() {
        const container = document.getElementById('alertsContainer');
        
        if (this.alerts.length === 0) {
            container.innerHTML = '<p style="text-align: center; color: #666;">No recent alerts</p>';
            return;
        }

        container.innerHTML = this.alerts.map(alert => `
            <div class="alert-item ${alert.type}">
                <div class="alert-time">${alert.timeAgo} • ${alert.platform}</div>
                <div class="alert-message">${alert.icon} ${alert.message}</div>
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
            </div>
        `).join('');
    }

    async getFromStorage(keys) {
        return new Promise((resolve) => {
            try {
                if (typeof chrome !== 'undefined' && chrome.storage) {
                    chrome.storage.local.get(keys, resolve);
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
                    resolve(result);
                }
            } catch (error) {
                console.log('Storage error:', error);
                resolve({});
            }
        });
    }

    async saveToStorage(data) {
        try {
            if (typeof chrome !== 'undefined' && chrome.storage) {
                chrome.storage.local.set(data);
            } else {
                // Fallback to localStorage
                Object.entries(data).forEach(([key, value]) => {
                    localStorage.setItem(key, typeof value === 'object' ? JSON.stringify(value) : value);
                });
            }
        } catch (error) {
            console.log('Storage save error:', error);
        }
    }

    startRealTimeUpdates() {
        // Update data every 5 minutes
        setInterval(() => {
            this.loadUserData().then(() => {
                this.populateDashboard();
                if (this.trendChart) {
                    this.trendChart.data.datasets[0].data = this.trendData.map(d => d.score);
                    this.trendChart.update();
                }
                if (this.contentChart) {
                    this.contentChart.data.datasets[0].data = [
                        this.contentBreakdown.positive,
                        this.contentBreakdown.negative,
                        this.contentBreakdown.neutral,
                        this.contentBreakdown.toxic
                    ];
                    this.contentChart.update();
                }
            });
        }, 5 * 60 * 1000); // 5 minutes
    }
}

// Initialize dashboard when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new DashboardManager();
});
document.getElementById('signupNavBtn').addEventListener('click', function() {
    window.location.href = 'signup.html';
});