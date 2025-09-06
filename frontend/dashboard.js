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
            const response = await fetch('http://localhost:3000/api/dashboard');
            if (response.ok) {
                const data = await response.json();
                this.dailyScore = data.moodScore;
                this.trendData = this.generateTrendDataFromArray(data.sentimentTrend);
                this.contentBreakdown = data.contentBreakdown;
                this.calmModeEnabled = data.calmMode;
                this.alerts = data.alerts.length ? data.alerts : this.generateSampleAlerts();
                this.achievements = this.generateAchievements();
            } else {
                throw new Error('Backend not available');
            }
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
        calmToggle.addEventListener('change', async (e) => {
            this.calmModeEnabled = e.target.checked;
            this.updateCalmMode();
            await this.updateCalmModeBackend(this.calmModeEnabled);
        });

        // Update calm mode display
        this.updateCalmMode();
        
        // Goals functionality
        document.getElementById('addGoalBtn').addEventListener('click', () => {
            this.addGoal();
        });
        
        document.getElementById('goalInput').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.addGoal();
        });
        
        // Load insights and goals
        this.loadInsights();
        this.loadGoals();
        
        // AI features
        document.getElementById('generateReportBtn').addEventListener('click', () => {
            this.generateAIReport();
        });
        
        document.getElementById('getSuggestionsBtn').addEventListener('click', () => {
            this.getAISuggestions();
        });
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
        // Always use fallback charts for now
        this.createFallbackCharts();
    }
    
    createFallbackCharts() {
        // Create dummy trend chart
        const trendCanvas = document.getElementById('trendChart');
        if (trendCanvas) {
            const ctx = trendCanvas.getContext('2d');
            ctx.fillStyle = '#FFD700';
            ctx.fillRect(0, 0, 400, 250);
            ctx.fillStyle = '#FF9933';
            ctx.font = '20px Arial';
            ctx.fillText('📈 Emotional Journey Chart', 100, 130);
        }
        
        // Create dummy pie chart
        const pieCanvas = document.getElementById('contentPieChart');
        if (pieCanvas) {
            const ctx = pieCanvas.getContext('2d');
            ctx.fillStyle = '#4CAF50';
            ctx.beginPath();
            ctx.arc(140, 140, 100, 0, Math.PI);
            ctx.fill();
            ctx.fillStyle = '#F44336';
            ctx.beginPath();
            ctx.arc(140, 140, 100, Math.PI, 1.5 * Math.PI);
            ctx.fill();
            ctx.fillStyle = '#FF9800';
            ctx.beginPath();
            ctx.arc(140, 140, 100, 1.5 * Math.PI, 2 * Math.PI);
            ctx.fill();
        }
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

    generateTrendDataFromArray(scores) {
        const data = [];
        const today = new Date();
        
        scores.forEach((score, i) => {
            const date = new Date(today);
            date.setDate(date.getDate() - (6 - i));
            data.push({
                date: date.toISOString().slice(0, 10),
                score: score
            });
        });
        
        return data;
    }

    async updateCalmModeBackend(enabled) {
        try {
            await fetch('http://localhost:3000/api/calm-mode', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ enabled })
            });
        } catch (error) {
            console.log('Backend update failed:', error);
        }
    }

    async addGoal() {
        const input = document.getElementById('goalInput');
        const goal = input.value.trim();
        
        if (!goal) return;
        
        try {
            await fetch('http://localhost:3000/api/goals', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ goal })
            });
            
            input.value = '';
            this.loadGoals();
        } catch (error) {
            console.log('Goal add failed:', error);
        }
    }
    
    async loadGoals() {
        try {
            const response = await fetch('http://localhost:3000/api/dashboard');
            const data = await response.json();
            this.populateGoals(data.goals || []);
        } catch (error) {
            console.log('Goals load failed:', error);
        }
    }
    
    async loadInsights() {
        try {
            const response = await fetch('http://localhost:3000/api/insights');
            const data = await response.json();
            this.populateInsights(data.insights || []);
            this.populateRecentContent(data.analyzedContent || []);
        } catch (error) {
            console.log('Insights load failed:', error);
        }
    }
    
    populateGoals(goals) {
        const container = document.getElementById('goalsContainer');
        
        if (goals.length === 0) {
            container.innerHTML = '<p style="text-align: center; color: #666;">No goals set yet. Add your first learning goal!</p>';
            return;
        }
        
        container.innerHTML = goals.map(goal => `
            <div class="goal-item">
                <span class="goal-text">${goal.goal}</span>
                <span class="goal-date">Added ${new Date(goal.created).toLocaleDateString()}</span>
            </div>
        `).join('');
    }
    
    populateInsights(insights) {
        const container = document.getElementById('insightsContainer');
        
        if (insights.length === 0) {
            container.innerHTML = '<p style="text-align: center; color: #666;">No insights available yet. Browse some content to get insights!</p>';
            return;
        }
        
        container.innerHTML = insights.map(insight => `
            <div class="insight-item ${insight.type}">
                <span class="insight-icon">${insight.icon}</span>
                <span class="insight-message">${insight.message}</span>
            </div>
        `).join('');
    }
    
    populateRecentContent(content) {
        const container = document.getElementById('recentContentContainer');
        
        if (content.length === 0) {
            container.innerHTML = '<p style="text-align: center; color: #666;">No content analyzed yet. Visit YouTube or social media to see analysis!</p>';
            return;
        }
        
        container.innerHTML = content.map(item => `
            <div class="content-item ${item.sentiment}">
                <div class="content-text">${item.text}...</div>
                <div class="content-meta">
                    <span class="sentiment-badge ${item.sentiment}">${item.sentiment}</span>
                    <span class="platform">${item.platform}</span>
                    <span class="time">${new Date(item.timestamp).toLocaleTimeString()}</span>
                </div>
            </div>
        `).join('');
    }

    async generateAIReport() {
        const btn = document.getElementById('generateReportBtn');
        const container = document.getElementById('aiReportContainer');
        
        btn.textContent = 'Generating...';
        btn.disabled = true;
        container.innerHTML = '<p style="text-align: center;">🤖 AI is analyzing your data...</p>';
        
        try {
            const response = await fetch('http://localhost:3000/api/generate-report', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' }
            });
            
            const data = await response.json();
            
            if (data.success) {
                container.innerHTML = `<div class="ai-report">${data.report.replace(/\n/g, '<br>')}</div>`;
            } else {
                container.innerHTML = '<p style="color: #f44336;">Report generation failed. Please try again.</p>';
            }
        } catch (error) {
            container.innerHTML = '<p style="color: #f44336;">Unable to connect to AI service.</p>';
        }
        
        btn.textContent = 'Generate Report';
        btn.disabled = false;
    }
    
    async getAISuggestions() {
        const btn = document.getElementById('getSuggestionsBtn');
        const container = document.getElementById('aiSuggestionsContainer');
        
        btn.textContent = 'Loading...';
        btn.disabled = true;
        container.innerHTML = '<p style="text-align: center;">🤖 AI is creating personalized suggestions...</p>';
        
        try {
            const response = await fetch('http://localhost:3000/api/get-suggestions', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' }
            });
            
            const data = await response.json();
            
            if (data.success && Array.isArray(data.suggestions)) {
                container.innerHTML = data.suggestions.map(suggestion => `
                    <div class="suggestion-card">
                        <h4>${suggestion.title}</h4>
                        <p>${suggestion.description}</p>
                    </div>
                `).join('');
            } else {
                container.innerHTML = '<p style="color: #f44336;">Suggestions unavailable. Please try again.</p>';
            }
        } catch (error) {
            container.innerHTML = '<p style="color: #f44336;">Unable to connect to AI service.</p>';
        }
        
        btn.textContent = 'Get Suggestions';
        btn.disabled = false;
    }

    startRealTimeUpdates() {
        setInterval(() => {
            this.loadUserData().then(() => {
                this.populateDashboard();
                this.loadInsights();
                if (this.trendChart && typeof Chart !== 'undefined') {
                    this.trendChart.data.datasets[0].data = this.trendData.map(d => d.score);
                    this.trendChart.update();
                }
                if (this.contentChart && typeof Chart !== 'undefined') {
                    this.contentChart.data.datasets[0].data = [
                        this.contentBreakdown.uplifting,
                        this.contentBreakdown.negative,
                        this.contentBreakdown.neutral,
                        this.contentBreakdown.toxic
                    ];
                    this.contentChart.update();
                }
            });
        }, 10000); // 10 seconds
    }
}

// Initialize dashboard when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new DashboardManager();
});
document.getElementById('signupNavBtn').addEventListener('click', function() {
    window.location.href = 'signup.html';
});