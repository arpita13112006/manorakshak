// Deep Analysis Page JavaScript
class DeepAnalyzer {
    constructor() {
        this.userData = {};
        this.sentimentTrend = [];
        this.contentBreakdown = {};
        this.analyzedContent = [];
        this.insights = [];
        this.trendChart = null;
        this.scoreChart = null;
        
        this.init();
    }

    async init() {
        await this.loadAnalysisData();
        this.setupEventListeners();
        this.initializeCharts();
        this.populateAnalysis();
        this.startRealTimeUpdates();
    }

    async loadAnalysisData() {
        try {
            const response = await fetch('http://localhost:3000/api/dashboard');
            if (response.ok) {
                const data = await response.json();
                this.userData = data;
                this.sentimentTrend = data.sentimentTrend || [];
                this.contentBreakdown = data.contentBreakdown || {};
                this.analyzedContent = data.analyzedContent || [];
                
                // Load insights
                const insightsResponse = await fetch('http://localhost:3000/api/insights');
                if (insightsResponse.ok) {
                    const insightsData = await insightsResponse.json();
                    this.insights = insightsData.insights || [];
                }
            } else {
                throw new Error('Backend not available');
            }
        } catch (error) {
            console.log('Using default data:', error);
            this.generateDefaultAnalysisData();
        }
    }

    generateDefaultAnalysisData() {
        this.userData = {
            moodScore: 65,
            sentimentTrend: [45, 52, 48, 65, 70, 58, 65],
            contentBreakdown: { uplifting: 40, negative: 25, neutral: 30, toxic: 5 }
        };
        this.sentimentTrend = this.userData.sentimentTrend;
        this.contentBreakdown = this.userData.contentBreakdown;
        this.analyzedContent = this.generateSampleAnalyzedContent();
        this.insights = this.generateSampleInsights();
    }

    generateSampleAnalyzedContent() {
        return [
            { text: "Motivational video about achieving goals", sentiment: "positive", platform: "YouTube", timestamp: new Date() },
            { text: "Sad news about global events", sentiment: "negative", platform: "Facebook", timestamp: new Date() },
            { text: "Beautiful sunset photography", sentiment: "positive", platform: "Instagram", timestamp: new Date() },
            { text: "Toxic argument in comments", sentiment: "toxic", platform: "Twitter", timestamp: new Date() }
        ];
    }

    generateSampleInsights() {
        return [
            { type: 'positive', message: 'Your mood improves by 15% when viewing nature content', icon: '🌿' },
            { type: 'warning', message: 'Negative content consumption peaks at 8-10 PM', icon: '⚠️' },
            { type: 'suggestion', message: 'Consider following more educational channels', icon: '💡' }
        ];
    }

    setupEventListeners() {
        // Back button
        document.getElementById('backBtn').addEventListener('click', () => {
            window.location.href = 'dashboard.html';
        });

        // AI insights
        document.getElementById('generateInsightsBtn').addEventListener('click', () => {
            this.generateAIInsights();
        });

        document.getElementById('getPersonalizedTipsBtn').addEventListener('click', () => {
            this.getPersonalizedTips();
        });
    }

    initializeCharts() {
        if (typeof Chart !== 'undefined') {
            this.initializeSentimentTrendChart();
            this.initializeScoreBreakdownChart();
        } else {
            console.log('Chart.js not loaded');
        }
    }

    initializeSentimentTrendChart() {
        const ctx = document.getElementById('sentimentTrendChart').getContext('2d');
        
        const labels = this.generateDateLabels();
        
        this.trendChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Mood Score Trend',
                    data: this.sentimentTrend,
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
                        display: true,
                        position: 'top'
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        max: 100,
                        grid: {
                            color: 'rgba(0, 0, 0, 0.1)'
                        },
                        title: {
                            display: true,
                            text: 'Mood Score (%)'
                        }
                    },
                    x: {
                        grid: {
                            color: 'rgba(0, 0, 0, 0.1)'
                        },
                        title: {
                            display: true,
                            text: 'Days'
                        }
                    }
                }
            }
        });
    }

    initializeScoreBreakdownChart() {
        const ctx = document.getElementById('scoreBreakdownChart').getContext('2d');
        
        this.scoreChart = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: ['Positive', 'Negative', 'Neutral', 'Toxic'],
                datasets: [{
                    data: [
                        this.contentBreakdown.uplifting || 0,
                        this.contentBreakdown.negative || 0,
                        this.contentBreakdown.neutral || 0,
                        this.contentBreakdown.toxic || 0
                    ],
                    backgroundColor: [
                        '#4caf50',
                        '#f44336',
                        '#ff9800',
                        '#ff5722'
                    ],
                    borderWidth: 3,
                    borderColor: '#ffffff'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom'
                    }
                }
            }
        });
    }

    generateDateLabels() {
        const labels = [];
        const today = new Date();
        
        for (let i = 6; i >= 0; i--) {
            const date = new Date(today);
            date.setDate(date.getDate() - i);
            labels.push(date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }));
        }
        
        return labels;
    }

    populateAnalysis() {
        // Update greeting and status
        const currentScore = this.userData.moodScore || 65;
        const trend = this.calculateTrend();
        
        document.getElementById('analysisGreeting').textContent = 
            `🔍 Deep Analysis (Score: ${currentScore}%)`;
        
        const statusText = trend > 0 ? 
            `Your mental wellbeing is trending upward (+${trend}%) 📈` :
            trend < 0 ?
            `Your mental wellbeing needs attention (${trend}%) 📉` :
            'Your mental wellbeing is stable 📊';
        
        document.getElementById('analysisStatus').textContent = statusText;

        // Populate all sections
        this.populateMoodCorrelation();
        this.populatePatternInsights();
        this.populateRecommendations();
        this.populateWeeklyProgress();
    }

    calculateTrend() {
        if (this.sentimentTrend.length < 2) return 0;
        
        const recent = this.sentimentTrend.slice(-3);
        const older = this.sentimentTrend.slice(0, 3);
        
        const recentAvg = recent.reduce((a, b) => a + b, 0) / recent.length;
        const olderAvg = older.reduce((a, b) => a + b, 0) / older.length;
        
        return Math.round(recentAvg - olderAvg);
    }

    populateMoodCorrelation() {
        const container = document.getElementById('moodCorrelationContainer');
        
        // Analyze content for mood triggers
        const positiveContent = this.analyzedContent.filter(c => c.sentiment === 'positive');
        const negativeContent = this.analyzedContent.filter(c => c.sentiment === 'negative');
        const toxicContent = this.analyzedContent.filter(c => c.sentiment === 'toxic');
        
        const positiveTriggers = this.extractTriggers(positiveContent);
        const negativeTriggers = this.extractTriggers(negativeContent);
        
        container.innerHTML = `
            <div class="analysis-grid">
                <div class="analysis-card positive">
                    <h4>📈 Positive Triggers</h4>
                    <ul>
                        ${positiveTriggers.map(trigger => `<li>${trigger}</li>`).join('')}
                    </ul>
                    <p class="trigger-count">${positiveContent.length} positive interactions</p>
                </div>
                <div class="analysis-card negative">
                    <h4>📉 Negative Triggers</h4>
                    <ul>
                        ${negativeTriggers.map(trigger => `<li>${trigger}</li>`).join('')}
                    </ul>
                    <p class="trigger-count">${negativeContent.length + toxicContent.length} negative interactions</p>
                </div>
            </div>
        `;
    }

    extractTriggers(content) {
        if (content.length === 0) {
            return ['No data available yet'];
        }
        
        const platforms = [...new Set(content.map(c => c.platform))];
        const triggers = [];
        
        platforms.forEach(platform => {
            const count = content.filter(c => c.platform === platform).length;
            triggers.push(`${platform} content (${count} items)`);
        });
        
        return triggers.length > 0 ? triggers : ['Mixed content sources'];
    }

    populatePatternInsights() {
        const container = document.getElementById('patternInsightsContainer');
        
        // Analyze time patterns from analyzed content
        const hourlyData = this.analyzeHourlyPatterns();
        const platformData = this.analyzePlatformPatterns();
        
        container.innerHTML = `
            <div class="pattern-insights">
                <div class="insight-item">
                    <span class="insight-icon">🌅</span>
                    <div>
                        <h4>Peak Activity Time</h4>
                        <p>${hourlyData.peak} - Most content consumed</p>
                    </div>
                </div>
                <div class="insight-item">
                    <span class="insight-icon">📱</span>
                    <div>
                        <h4>Primary Platform</h4>
                        <p>${platformData.primary} - ${platformData.percentage}% of content</p>
                    </div>
                </div>
                <div class="insight-item">
                    <span class="insight-icon">📊</span>
                    <div>
                        <h4>Content Quality</h4>
                        <p>${this.getQualityAssessment()}</p>
                    </div>
                </div>
            </div>
        `;
    }

    analyzeHourlyPatterns() {
        // Simulate hourly analysis
        const hours = ['Morning (6-12)', 'Afternoon (12-18)', 'Evening (18-24)'];
        return {
            peak: hours[Math.floor(Math.random() * hours.length)]
        };
    }

    analyzePlatformPatterns() {
        if (this.analyzedContent.length === 0) {
            return { primary: 'No data', percentage: 0 };
        }
        
        const platforms = {};
        this.analyzedContent.forEach(content => {
            platforms[content.platform] = (platforms[content.platform] || 0) + 1;
        });
        
        const primary = Object.keys(platforms).reduce((a, b) => 
            platforms[a] > platforms[b] ? a : b
        );
        
        const percentage = Math.round((platforms[primary] / this.analyzedContent.length) * 100);
        
        return { primary, percentage };
    }

    getQualityAssessment() {
        const total = Object.values(this.contentBreakdown).reduce((a, b) => a + b, 0);
        if (total === 0) return 'No content analyzed yet';
        
        const positiveRatio = this.contentBreakdown.uplifting / total;
        
        if (positiveRatio >= 0.7) return 'Excellent - Mostly positive content';
        if (positiveRatio >= 0.5) return 'Good - Balanced content mix';
        if (positiveRatio >= 0.3) return 'Fair - Room for improvement';
        return 'Poor - Consider content curation';
    }

    populateRecommendations() {
        const container = document.getElementById('recommendationsContainer');
        
        const recommendations = this.generatePersonalizedRecommendations();
        
        container.innerHTML = `
            <div class="recommendations">
                ${recommendations.map(rec => `
                    <div class="recommendation-card">
                        <span class="rec-icon">${rec.icon}</span>
                        <h4>${rec.title}</h4>
                        <p>${rec.description}</p>
                        <div class="rec-priority ${rec.priority}">${rec.priority.toUpperCase()}</div>
                    </div>
                `).join('')}
            </div>
        `;
    }

    generatePersonalizedRecommendations() {
        const total = Object.values(this.contentBreakdown).reduce((a, b) => a + b, 0);
        const recommendations = [];
        
        if (total === 0) {
            return [{
                icon: '📱',
                title: 'Start Monitoring',
                description: 'Visit social media platforms to begin content analysis',
                priority: 'high'
            }];
        }
        
        const toxicRatio = this.contentBreakdown.toxic / total;
        const negativeRatio = this.contentBreakdown.negative / total;
        const positiveRatio = this.contentBreakdown.uplifting / total;
        
        if (toxicRatio > 0.1) {
            recommendations.push({
                icon: '🛡️',
                title: 'Enable Content Filtering',
                description: 'Use Calm Mode to reduce exposure to toxic content',
                priority: 'high'
            });
        }
        
        if (negativeRatio > 0.4) {
            recommendations.push({
                icon: '🌿',
                title: 'Curate Positive Feed',
                description: 'Follow more uplifting and motivational accounts',
                priority: 'medium'
            });
        }
        
        if (positiveRatio < 0.3) {
            recommendations.push({
                icon: '🧘',
                title: 'Take Mindful Breaks',
                description: 'Schedule regular breaks from social media',
                priority: 'high'
            });
        }
        
        recommendations.push({
            icon: '📚',
            title: 'Set Learning Goals',
            description: 'Add educational goals to filter relevant content',
            priority: 'low'
        });
        
        return recommendations;
    }

    populateWeeklyProgress() {
        const container = document.getElementById('weeklyProgressContainer');
        
        const weeklyStats = this.calculateWeeklyStats();
        
        container.innerHTML = `
            <div class="weekly-progress">
                <div class="progress-stat">
                    <h4>📈 Mood Improvement</h4>
                    <div class="stat-value ${weeklyStats.moodChange >= 0 ? 'positive' : 'negative'}">
                        ${weeklyStats.moodChange >= 0 ? '+' : ''}${weeklyStats.moodChange}%
                    </div>
                    <p>Compared to last week</p>
                </div>
                <div class="progress-stat">
                    <h4>🎯 Content Quality</h4>
                    <div class="stat-value">
                        ${weeklyStats.qualityScore}%
                    </div>
                    <p>Positive content ratio</p>
                </div>
                <div class="progress-stat">
                    <h4>⚠️ Toxic Exposure</h4>
                    <div class="stat-value ${weeklyStats.toxicReduction >= 0 ? 'positive' : 'negative'}">
                        ${weeklyStats.toxicReduction >= 0 ? '-' : '+'}${Math.abs(weeklyStats.toxicReduction)}%
                    </div>
                    <p>Change in toxic content</p>
                </div>
                <div class="progress-stat">
                    <h4>📊 Analysis Count</h4>
                    <div class="stat-value">
                        ${this.analyzedContent.length}
                    </div>
                    <p>Items analyzed this week</p>
                </div>
            </div>
        `;
    }

    calculateWeeklyStats() {
        const total = Object.values(this.contentBreakdown).reduce((a, b) => a + b, 0);
        
        return {
            moodChange: this.calculateTrend(),
            qualityScore: total > 0 ? Math.round((this.contentBreakdown.uplifting / total) * 100) : 0,
            toxicReduction: Math.floor(Math.random() * 10), // Simulated
            analysisCount: this.analyzedContent.length
        };
    }

    async generateAIInsights() {
        const btn = document.getElementById('generateInsightsBtn');
        const container = document.getElementById('aiInsightsContainer');
        
        btn.textContent = 'Generating...';
        btn.disabled = true;
        container.innerHTML = '<p style="text-align: center;">🤖 AI is analyzing your behavioral patterns...</p>';
        
        try {
            const response = await fetch('http://localhost:3000/api/generate-report', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' }
            });
            
            const data = await response.json();
            
            if (data.success) {
                container.innerHTML = `
                    <div class="ai-insights">
                        <h4>🤖 AI Deep Analysis Report</h4>
                        <div class="ai-report-content">
                            ${data.report.replace(/\n/g, '<br>')}
                        </div>
                    </div>
                `;
            } else {
                container.innerHTML = '<p style="color: #f44336;">AI analysis temporarily unavailable. Please try again later.</p>';
            }
        } catch (error) {
            container.innerHTML = '<p style="color: #f44336;">Unable to connect to AI service.</p>';
        }
        
        btn.textContent = 'Generate Deep Insights';
        btn.disabled = false;
    }

    async getPersonalizedTips() {
        const btn = document.getElementById('getPersonalizedTipsBtn');
        const container = document.getElementById('aiInsightsContainer');
        
        btn.textContent = 'Loading...';
        btn.disabled = true;
        container.innerHTML = '<p style="text-align: center;">🤖 AI is creating personalized wellness tips...</p>';
        
        try {
            const response = await fetch('http://localhost:3000/api/get-suggestions', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' }
            });
            
            const data = await response.json();
            
            if (data.success && Array.isArray(data.suggestions)) {
                container.innerHTML = `
                    <div class="ai-tips">
                        <h4>💡 Personalized Wellness Tips</h4>
                        <div class="tips-grid">
                            ${data.suggestions.map(tip => `
                                <div class="tip-card">
                                    <h5>${tip.title}</h5>
                                    <p>${tip.description}</p>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                `;
            } else {
                container.innerHTML = '<p style="color: #f44336;">Personalized tips unavailable. Please try again later.</p>';
            }
        } catch (error) {
            container.innerHTML = '<p style="color: #f44336;">Unable to connect to AI service.</p>';
        }
        
        btn.textContent = 'Get Personalized Tips';
        btn.disabled = false;
    }

    startRealTimeUpdates() {
        setInterval(async () => {
            await this.loadAnalysisData();
            this.populateAnalysis();
            
            // Update charts
            if (this.trendChart && typeof Chart !== 'undefined') {
                this.trendChart.data.datasets[0].data = this.sentimentTrend;
                this.trendChart.update();
            }
            
            if (this.scoreChart && typeof Chart !== 'undefined') {
                this.scoreChart.data.datasets[0].data = [
                    this.contentBreakdown.uplifting || 0,
                    this.contentBreakdown.negative || 0,
                    this.contentBreakdown.neutral || 0,
                    this.contentBreakdown.toxic || 0
                ];
                this.scoreChart.update();
            }
        }, 10000); // Update every 10 seconds
    }
}

// Initialize deep analyzer when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new DeepAnalyzer();
});