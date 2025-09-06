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
        this.videoAnalytics = {};
        
        this.init();
    }

    async init() {
        await this.loadUserData();
        await this.loadVideoAnalytics();
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
        this.createVideoCharts();
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
    
    createVideoCharts() {
        setTimeout(() => {
            this.createVideoTrendChart();
            this.createCategoryChart();
        }, 100);
    }
    
    createVideoTrendChart() {
        const canvas = document.getElementById('videoTrendChart');
        if (!canvas) return;
        
        const ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        const data = this.videoAnalytics.dailyStats || [];
        
        if (data.length === 0) {
            ctx.fillStyle = 'white';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            ctx.fillStyle = '#8B4513';
            ctx.font = 'bold 16px Arial';
            ctx.textAlign = 'center';
            ctx.fillText('📊 Click "Add Sample Videos" to see chart', canvas.width/2, canvas.height/2);
            return;
        }
        
        ctx.fillStyle = 'white';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        const maxVideos = Math.max(...data.map(d => d.videos), 1);
        const barWidth = 40;
        const spacing = 10;
        const startX = 30;
        
        data.forEach((day, i) => {
            const x = startX + i * (barWidth + spacing);
            const height = (day.videos / maxVideos) * 120;
            const y = 150 - height;
            
            ctx.fillStyle = '#d4a017';
            ctx.fillRect(x, y, barWidth, height);
            
            ctx.fillStyle = '#333';
            ctx.font = '10px Arial';
            ctx.textAlign = 'center';
            ctx.fillText(day.date.slice(-5), x + barWidth/2, 170);
            ctx.fillText(day.videos.toString(), x + barWidth/2, y - 5);
        });
    }
    
    createCategoryChart() {
        const canvas = document.getElementById('categoryChart');
        if (!canvas) return;
        
        const ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        const categories = this.videoAnalytics.categoryBreakdown || {};
        
        if (Object.keys(categories).length === 0) {
            ctx.fillStyle = 'white';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            ctx.fillStyle = '#8B4513';
            ctx.font = 'bold 16px Arial';
            ctx.textAlign = 'center';
            ctx.fillText('🎭 Click "Add Sample Videos"', canvas.width/2, canvas.height/2 - 10);
            ctx.fillText('to see categories', canvas.width/2, canvas.height/2 + 10);
            return;
        }
        
        ctx.fillStyle = 'white';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        const centerX = canvas.width / 2;
        const centerY = canvas.height / 2;
        const radius = 80;
        
        const total = Object.values(categories).reduce((sum, count) => sum + count, 0);
        const colors = ['#d4a017', '#8B4513', '#FF6B35', '#4ECDC4', '#45B7D1', '#96CEB4'];
        
        let currentAngle = 0;
        Object.entries(categories).forEach(([category, count], i) => {
            const sliceAngle = (count / total) * 2 * Math.PI;
            
            ctx.beginPath();
            ctx.moveTo(centerX, centerY);
            ctx.arc(centerX, centerY, radius, currentAngle, currentAngle + sliceAngle);
            ctx.closePath();
            ctx.fillStyle = colors[i % colors.length];
            ctx.fill();
            ctx.strokeStyle = 'white';
            ctx.lineWidth = 2;
            ctx.stroke();
            
            const labelAngle = currentAngle + sliceAngle / 2;
            const labelX = centerX + Math.cos(labelAngle) * (radius + 30);
            const labelY = centerY + Math.sin(labelAngle) * (radius + 30);
            
            ctx.fillStyle = '#333';
            ctx.font = '11px Arial';
            ctx.textAlign = 'center';
            ctx.fillText(category, labelX, labelY);
            
            currentAngle += sliceAngle;
        });
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
        
        // Populate video analytics
        this.populateVideoAnalytics();
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
        
        container.innerHTML = content.map(item => {
            const timeAgo = this.getTimeAgo(new Date(item.timestamp));
            const contentType = item.contentType || 'general';
            const icon = this.getContentIcon(contentType, item.platform);
            
            let displayText = item.text;
            if (item.videoData && item.videoData.title) {
                displayText = `🎥 ${item.videoData.title}`;
                if (item.videoData.channel) {
                    displayText += ` - ${item.videoData.channel}`;
                }
            }
            
            return `
                <div class="content-item ${item.sentiment}">
                    <div class="content-text">${icon} ${displayText}</div>
                    <div class="content-meta">
                        <span class="sentiment-badge ${item.sentiment}">${this.capitalizeFirst(item.sentiment)}</span>
                        <span class="platform">📍 ${item.platform}</span>
                        <span class="time">⏰ ${timeAgo}</span>
                        ${item.channel ? `<span class="channel">👤 ${item.channel}</span>` : ''}
                    </div>
                </div>
            `;
        }).join('');
    }
    
    getContentIcon(contentType, platform) {
        const icons = {
            'video_title': '🎥',
            'video_description': '📝',
            'comment': '💬',
            'post': '📱',
            'tweet': '🐦',
            'caption': '📸'
        };
        
        return icons[contentType] || (platform === 'YouTube' ? '📺' : '📱');
    }
    
    capitalizeFirst(str) {
        return str.charAt(0).toUpperCase() + str.slice(1);
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

    async loadVideoAnalytics() {
        try {
            const response = await fetch('http://localhost:3000/api/video-analytics');
            if (response.ok) {
                this.videoAnalytics = await response.json();
            }
        } catch (error) {
            console.log('Video analytics load failed:', error);
            this.videoAnalytics = {
                totalVideos: 0,
                totalWatchTime: 0,
                categoryBreakdown: {},
                sentimentBreakdown: { positive: 0, negative: 0, neutral: 0, toxic: 0 },
                dailyStats: [],
                platformStats: {},
                weeklyTrend: []
            };
        }
    }
    
    populateVideoAnalytics() {
        const analytics = this.videoAnalytics;
        
        // Update stats
        document.getElementById('totalVideos').textContent = analytics.totalVideos || 0;
        
        const hours = Math.floor((analytics.totalWatchTime || 0) / 3600);
        const minutes = Math.floor(((analytics.totalWatchTime || 0) % 3600) / 60);
        document.getElementById('totalWatchTime').textContent = hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;
        
        const avgSentiment = this.calculateOverallSentiment(analytics.sentimentBreakdown);
        document.getElementById('avgSentiment').textContent = `${avgSentiment}%`;
        
        // Populate recent videos
        this.populateRecentVideos();
    }
    
    calculateOverallSentiment(breakdown) {
        const total = Object.values(breakdown).reduce((sum, count) => sum + count, 0);
        if (total === 0) return 0;
        
        const scores = { positive: 80, neutral: 50, negative: 20, toxic: 10 };
        const weightedSum = Object.entries(breakdown).reduce((sum, [sentiment, count]) => {
            return sum + (scores[sentiment] || 50) * count;
        }, 0);
        
        return Math.round(weightedSum / total);
    }
    
    async populateRecentVideos() {
        try {
            const response = await fetch('http://localhost:3000/api/dashboard');
            const data = await response.json();
            const videos = (data.videoHistory || []).slice(-5).reverse();
            
            const container = document.getElementById('recentVideosContainer');
            
            if (videos.length === 0) {
                container.innerHTML = '<p style="text-align: center; color: #666;">No video history available. Start watching videos to see analytics!</p>';
                return;
            }
            
            container.innerHTML = videos.map(video => `
                <div class="video-item ${video.sentiment}">
                    <div class="video-title">🎥 ${video.title}</div>
                    ${video.description ? `<div class="video-description">${video.description.substring(0, 100)}${video.description.length > 100 ? '...' : ''}</div>` : ''}
                    <div class="video-meta">
                        <span class="sentiment-badge ${video.sentiment}">${this.capitalizeFirst(video.sentiment)}</span>
                        <span>🎭 ${video.category}</span>
                        <span>⏱️ ${this.formatDuration(video.duration)}</span>
                        <span>📺 ${video.platform}</span>
                        ${video.channel ? `<span>👤 ${video.channel}</span>` : ''}
                        <span>🕐 ${new Date(video.timestamp).toLocaleTimeString()}</span>
                    </div>
                </div>
            `).join('');
        } catch (error) {
            console.log('Recent videos load failed:', error);
        }
    }
    
    formatDuration(seconds) {
        if (!seconds) return '0s';
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        const secs = seconds % 60;
        
        if (hours > 0) return `${hours}h ${minutes}m`;
        if (minutes > 0) return `${minutes}m ${secs}s`;
        return `${secs}s`;
    }
    
    // Method to simulate adding video history (for testing)
    async addSampleVideo() {
        const sampleVideos = [
            { title: 'Meditation Tutorial', duration: 600, category: 'Wellness', sentiment: 'positive', platform: 'YouTube' },
            { title: 'Cooking Recipe', duration: 480, category: 'Lifestyle', sentiment: 'neutral', platform: 'YouTube' },
            { title: 'News Update', duration: 300, category: 'News', sentiment: 'negative', platform: 'YouTube' },
            { title: 'Comedy Sketch', duration: 240, category: 'Entertainment', sentiment: 'positive', platform: 'YouTube' },
            { title: 'Educational Content', duration: 720, category: 'Education', sentiment: 'positive', platform: 'YouTube' }
        ];
        
        const video = sampleVideos[Math.floor(Math.random() * sampleVideos.length)];
        
        try {
            await fetch('http://localhost:3000/api/video-history', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(video)
            });
            
            await this.loadVideoAnalytics();
            this.populateVideoAnalytics();
            this.createVideoCharts();
        } catch (error) {
            console.log('Sample video add failed:', error);
        }
    }

    startRealTimeUpdates() {
        setInterval(() => {
            this.loadUserData().then(() => {
                this.populateDashboard();
                this.loadInsights();
                this.loadVideoAnalytics().then(() => {
                    this.createVideoCharts();
                });
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