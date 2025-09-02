// Content Analysis Page JavaScript
class ContentAnalyzer {
    constructor() {
        this.contentData = {};
        this.platformUsage = {};
        this.recentContent = [];
        this.goals = [];
        this.contentChart = null;
        
        this.init();
    }

    async init() {
        await this.loadContentData();
        this.setupEventListeners();
        this.initializeChart();
        this.populateContent();
        this.startRealTimeUpdates();
    }

    async loadContentData() {
        try {
            const response = await fetch('http://localhost:3000/api/dashboard');
            if (response.ok) {
                const data = await response.json();
                this.contentData = data.contentBreakdown;
                this.recentContent = data.analyzedContent || [];
                this.goals = data.goals || [];
                this.generatePlatformUsage();
            } else {
                throw new Error('Backend not available');
            }
        } catch (error) {
            console.log('Using default data:', error);
            this.generateDefaultData();
        }
    }

    generateDefaultData() {
        this.contentData = {
            uplifting: 40,
            negative: 25,
            neutral: 30,
            toxic: 5
        };
        this.generatePlatformUsage();
        this.recentContent = this.generateSampleContent();
    }

    generatePlatformUsage() {
        const platforms = ['YouTube', 'Instagram', 'Facebook', 'Twitter'];
        this.platformUsage = {};
        
        platforms.forEach(platform => {
            const contentCount = this.recentContent.filter(c => c.platform === platform).length;
            const totalContent = this.recentContent.length || 1;
            const percentage = Math.round((contentCount / totalContent) * 100);
            
            this.platformUsage[platform] = {
                count: contentCount,
                percentage: percentage,
                hours: (Math.random() * 3 + 0.5).toFixed(1)
            };
        });
    }

    generateSampleContent() {
        const sampleContent = [
            { text: "Amazing motivational video about success", sentiment: "positive", platform: "YouTube", timestamp: new Date() },
            { text: "Breaking news about economic crisis", sentiment: "negative", platform: "Facebook", timestamp: new Date() },
            { text: "Beautiful nature photography", sentiment: "positive", platform: "Instagram", timestamp: new Date() },
            { text: "Toxic comment thread about politics", sentiment: "toxic", platform: "Twitter", timestamp: new Date() },
            { text: "Educational content about programming", sentiment: "positive", platform: "YouTube", timestamp: new Date() }
        ];
        return sampleContent;
    }

    setupEventListeners() {
        // Back button
        document.getElementById('backBtn').addEventListener('click', () => {
            window.location.href = 'dashboard.html';
        });

        // Goal management
        document.getElementById('addContentGoalBtn').addEventListener('click', () => {
            this.addGoal();
        });

        document.getElementById('contentGoalInput').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.addGoal();
        });
    }

    initializeChart() {
        if (typeof Chart !== 'undefined') {
            const ctx = document.getElementById('contentChart').getContext('2d');
            
            this.contentChart = new Chart(ctx, {
                type: 'bar',
                data: {
                    labels: ['Positive', 'Negative', 'Neutral', 'Toxic'],
                    datasets: [{
                        label: 'Content Count',
                        data: [
                            this.contentData.uplifting,
                            this.contentData.negative,
                            this.contentData.neutral,
                            this.contentData.toxic
                        ],
                        backgroundColor: [
                            '#4caf50',
                            '#f44336',
                            '#ff9800',
                            '#ff5722'
                        ],
                        borderColor: [
                            '#388e3c',
                            '#d32f2f',
                            '#f57c00',
                            '#e64a19'
                        ],
                        borderWidth: 2
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
        } else {
            console.log('Chart.js not loaded');
        }
    }

    populateContent() {
        // Update greeting and status
        const total = Object.values(this.contentData).reduce((a, b) => a + b, 0);
        const positivePercentage = Math.round((this.contentData.uplifting / total) * 100);
        
        document.getElementById('contentGreeting').textContent = `📊 Content Analysis (${total} items analyzed)`;
        
        const statusText = positivePercentage >= 70 ? 
            `Great! ${positivePercentage}% of your content is positive 🌟` :
            positivePercentage >= 50 ?
            `${positivePercentage}% positive content - room for improvement 🌼` :
            `Only ${positivePercentage}% positive content - consider using Calm Mode 🌿`;
        
        document.getElementById('contentStatus').textContent = statusText;

        // Populate platform usage
        this.populatePlatformUsage();
        
        // Populate content categories
        this.populateContentCategories();
        
        // Populate recent analysis
        this.populateRecentAnalysis();
        
        // Populate goals
        this.populateGoals();
        
        // Populate quality metrics
        this.populateQualityMetrics();
    }

    populatePlatformUsage() {
        const container = document.getElementById('platformUsageContainer');
        const platforms = Object.keys(this.platformUsage);
        
        if (platforms.length === 0) {
            container.innerHTML = '<p style="text-align: center; color: #666;">No platform data available yet. Visit social media to see usage statistics!</p>';
            return;
        }

        const platformIcons = {
            'YouTube': '📺',
            'Instagram': '📱',
            'Facebook': '📘',
            'Twitter': '🐦'
        };

        container.innerHTML = `
            <div class="platform-grid">
                ${platforms.map(platform => {
                    const data = this.platformUsage[platform];
                    return `
                        <div class="platform-card">
                            <div class="platform-icon">${platformIcons[platform] || '📱'}</div>
                            <h4>${platform}</h4>
                            <p>${data.count} items analyzed</p>
                            <p>${data.hours} hrs estimated</p>
                            <div class="usage-bar">
                                <div class="usage-fill" style="width: ${data.percentage}%"></div>
                            </div>
                            <span class="usage-percent">${data.percentage}%</span>
                        </div>
                    `;
                }).join('')}
            </div>
        `;
    }

    populateContentCategories() {
        const container = document.getElementById('contentCategoriesContainer');
        const total = Object.values(this.contentData).reduce((a, b) => a + b, 0);
        
        if (total === 0) {
            container.innerHTML = '<p style="text-align: center; color: #666;">No content categories available yet.</p>';
            return;
        }

        const categories = [
            { key: 'uplifting', name: 'Positive/Motivational', icon: '🌟', class: 'positive' },
            { key: 'negative', name: 'Negative/Sad', icon: '😔', class: 'negative' },
            { key: 'neutral', name: 'Neutral/News', icon: '📰', class: 'neutral' },
            { key: 'toxic', name: 'Toxic/Harmful', icon: '⚠️', class: 'toxic' }
        ];

        container.innerHTML = `
            <div class="content-categories">
                ${categories.map(category => {
                    const count = this.contentData[category.key] || 0;
                    const percentage = Math.round((count / total) * 100);
                    return `
                        <div class="category-item ${category.class}">
                            <span class="category-icon">${category.icon}</span>
                            <div class="category-info">
                                <h4>${category.name}</h4>
                                <p>${count} items (${percentage}%)</p>
                            </div>
                        </div>
                    `;
                }).join('')}
            </div>
        `;
    }

    populateRecentAnalysis() {
        const container = document.getElementById('recentAnalysisContainer');
        
        if (this.recentContent.length === 0) {
            container.innerHTML = '<p style="text-align: center; color: #666;">No content analyzed yet. Visit YouTube or social media to see real-time analysis!</p>';
            return;
        }

        container.innerHTML = this.recentContent.slice(-10).map(item => `
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

    populateGoals() {
        const container = document.getElementById('contentGoalsContainer');
        
        if (this.goals.length === 0) {
            container.innerHTML = '<p style="text-align: center; color: #666;">Add goals to filter content based on your interests!</p>';
            return;
        }

        container.innerHTML = this.goals.map(goal => `
            <div class="goal-item">
                <span class="goal-text">${goal.goal}</span>
                <span class="goal-date">Added ${new Date(goal.created).toLocaleDateString()}</span>
            </div>
        `).join('');
    }

    populateQualityMetrics() {
        const total = Object.values(this.contentData).reduce((a, b) => a + b, 0);
        
        if (total === 0) {
            document.getElementById('positiveMetric').textContent = 'No data';
            document.getElementById('negativeMetric').textContent = 'No data';
            document.getElementById('toxicMetric').textContent = 'No data';
            document.getElementById('neutralMetric').textContent = 'No data';
            return;
        }

        document.getElementById('positiveMetric').textContent = 
            `${this.contentData.uplifting} items (${Math.round((this.contentData.uplifting/total)*100)}%)`;
        document.getElementById('negativeMetric').textContent = 
            `${this.contentData.negative} items (${Math.round((this.contentData.negative/total)*100)}%)`;
        document.getElementById('toxicMetric').textContent = 
            `${this.contentData.toxic} items (${Math.round((this.contentData.toxic/total)*100)}%)`;
        document.getElementById('neutralMetric').textContent = 
            `${this.contentData.neutral} items (${Math.round((this.contentData.neutral/total)*100)}%)`;
    }

    async addGoal() {
        const input = document.getElementById('contentGoalInput');
        const goal = input.value.trim();
        
        if (!goal) return;
        
        try {
            const response = await fetch('http://localhost:3000/api/goals', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ goal })
            });
            
            if (response.ok) {
                input.value = '';
                await this.loadContentData();
                this.populateGoals();
            }
        } catch (error) {
            console.log('Goal add failed:', error);
            // Add locally as fallback
            this.goals.push({
                id: Date.now(),
                goal,
                created: new Date()
            });
            input.value = '';
            this.populateGoals();
        }
    }

    startRealTimeUpdates() {
        setInterval(async () => {
            await this.loadContentData();
            this.populateContent();
            
            if (this.contentChart && typeof Chart !== 'undefined') {
                this.contentChart.data.datasets[0].data = [
                    this.contentData.uplifting,
                    this.contentData.negative,
                    this.contentData.neutral,
                    this.contentData.toxic
                ];
                this.contentChart.update();
            }
        }, 5000); // Update every 5 seconds
    }
}

// Initialize content analyzer when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new ContentAnalyzer();
});