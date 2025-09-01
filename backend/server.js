const express = require('express');
const mongoose = require('mongoose');
const app = express();

app.use(express.json());
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Content-Type');
    next();
});

// MongoDB Schema
const userDataSchema = new mongoose.Schema({
    userId: { type: String, default: 'default' },
    moodScore: { type: Number, default: 60 },
    sentimentTrend: { type: [Number], default: [45, 52, 48, 65, 70, 58, 60] },
    contentBreakdown: {
        uplifting: { type: Number, default: 40 },
        negative: { type: Number, default: 25 },
        neutral: { type: Number, default: 30 },
        toxic: { type: Number, default: 5 }
    },
    alerts: { type: Array, default: [] },
    calmMode: { type: Boolean, default: false },
    goals: { type: Array, default: [] },
    insights: { type: Array, default: [] },
    analyzedContent: { type: Array, default: [] },
    lastUpdated: { type: Date, default: Date.now }
});

const UserData = mongoose.model('UserData', userDataSchema);

// MongoDB connection - REPLACE WITH YOUR CLUSTER ID
const MONGODB_URI = 'mongodb+srv://<username>:<password>@<cluster-id>.mongodb.net/manorakshak?retryWrites=true&w=majority';

let userData = {
    moodScore: 60,
    sentimentTrend: [45, 52, 48, 65, 70, 58, 60],
    contentBreakdown: { uplifting: 40, negative: 25, neutral: 30, toxic: 5 },
    alerts: [],
    calmMode: false,
    goals: [],
    insights: [],
    analyzedContent: []
};

async function connectMongoDB() {
    try {
        await mongoose.connect(MONGODB_URI);
        console.log('Connected to MongoDB');
        await loadUserData();
    } catch (error) {
        console.log('MongoDB connection failed, using local data:', error.message);
    }
}

async function loadUserData() {
    try {
        let data = await UserData.findOne({ userId: 'default' });
        if (!data) {
            data = new UserData({ userId: 'default' });
            await data.save();
        }
        userData = data.toObject();
        console.log('User data loaded from MongoDB');
    } catch (error) {
        console.log('Using default data:', error.message);
    }
}

async function saveUserData() {
    try {
        await UserData.findOneAndUpdate(
            { userId: 'default' },
            { ...userData, lastUpdated: new Date() },
            { upsert: true }
        );
    } catch (error) {
        console.log('Failed to save to MongoDB:', error.message);
    }
}

// Connect to MongoDB on startup
connectMongoDB();

app.get('/', (req, res) => {
    res.send("Manorakshak Backend Running!");
});

app.get('/api/dashboard', (req, res) => {
    res.json(userData);
});

app.post('/api/mood', (req, res) => {
    const { score } = req.body;
    userData.moodScore = score;
    res.json({ success: true, moodScore: score });
});

app.post('/api/calm-mode', (req, res) => {
    const { enabled } = req.body;
    userData.calmMode = enabled;
    saveUserData();
    res.json({ success: true, calmMode: enabled });
});

app.post('/api/analyze-content', (req, res) => {
    const { text, platform } = req.body;
    const sentiment = analyzeText(text);
    
    // Store analyzed content
    userData.analyzedContent.push({
        text: text.substring(0, 100),
        sentiment,
        platform,
        timestamp: new Date()
    });
    
    if (userData.analyzedContent.length > 50) {
        userData.analyzedContent = userData.analyzedContent.slice(-30);
    }
    
    updateUserData(sentiment, platform);
    res.json({ sentiment, updated: true });
});

app.post('/api/add-alert', (req, res) => {
    const { message, type, platform } = req.body;
    userData.alerts.unshift({
        message, type, platform,
        timestamp: new Date(),
        id: Date.now()
    });
    if (userData.alerts.length > 10) userData.alerts.pop();
    res.json({ success: true });
});

app.post('/api/goals', (req, res) => {
    const { goal } = req.body;
    userData.goals.push({
        id: Date.now(),
        goal,
        created: new Date(),
        progress: 0
    });
    saveUserData();
    res.json({ success: true, goals: userData.goals });
});

app.get('/api/insights', (req, res) => {
    const insights = generateInsights();
    res.json({ insights, analyzedContent: userData.analyzedContent.slice(-10) });
});

function analyzeText(text) {
    const positiveWords = ['happy', 'good', 'great', 'amazing', 'love', 'wonderful', 'excellent'];
    const negativeWords = ['sad', 'bad', 'hate', 'terrible', 'awful', 'horrible', 'depressed'];
    const toxicWords = ['kill', 'die', 'stupid', 'idiot', 'hate', 'violence'];
    
    const words = text.toLowerCase().split(' ');
    let positive = 0, negative = 0, toxic = 0;
    
    // Check if content matches user goals
    const goalMatch = checkGoalAlignment(text);
    
    words.forEach(word => {
        if (positiveWords.includes(word)) positive++;
        if (negativeWords.includes(word)) negative++;
        if (toxicWords.includes(word)) toxic++;
    });
    
    if (toxic > 0) return 'toxic';
    if (goalMatch) return 'positive'; // Goal-aligned content is positive
    if (positive > negative) return 'positive';
    if (negative > positive) return 'negative';
    return 'neutral';
}

function checkGoalAlignment(text) {
    const textLower = text.toLowerCase();
    
    return userData.goals.some(goal => {
        const goalWords = goal.goal.toLowerCase().split(' ');
        return goalWords.some(word => textLower.includes(word));
    });
}

function updateUserData(sentiment, platform) {
    // Update content breakdown
    if (sentiment === 'positive') userData.contentBreakdown.uplifting++;
    else if (sentiment === 'negative') userData.contentBreakdown.negative++;
    else if (sentiment === 'toxic') userData.contentBreakdown.toxic++;
    else userData.contentBreakdown.neutral++;
    
    // Recalculate mood score
    const total = Object.values(userData.contentBreakdown).reduce((a, b) => a + b, 0);
    userData.moodScore = Math.round((userData.contentBreakdown.uplifting / total) * 100);
    
    // Update trend
    userData.sentimentTrend.shift();
    userData.sentimentTrend.push(userData.moodScore);
    
    // Save data after each update
    saveUserData();
}

function generateInsights() {
    const insights = [];
    const total = Object.values(userData.contentBreakdown).reduce((a, b) => a + b, 0);
    
    if (userData.contentBreakdown.toxic > total * 0.1) {
        insights.push({
            type: 'warning',
            message: `${Math.round((userData.contentBreakdown.toxic/total)*100)}% of your content is toxic. Consider using Calm Mode.`,
            icon: '⚠️'
        });
    }
    
    if (userData.moodScore > 70) {
        insights.push({
            type: 'positive',
            message: 'Great job! Your content consumption is mostly positive today.',
            icon: '🌟'
        });
    }
    
    const recentContent = userData.analyzedContent.slice(-10);
    const negativeRecent = recentContent.filter(c => c.sentiment === 'negative').length;
    
    if (negativeRecent > 5) {
        insights.push({
            type: 'suggestion',
            message: 'You\'ve seen a lot of negative content recently. Take a mindful break.',
            icon: '🧘'
        });
    }
    
    return insights;
}

// Save data every 30 seconds
setInterval(saveUserData, 30000);

// Save data on exit
process.on('SIGINT', async () => {
    console.log('Saving data before exit...');
    await saveUserData();
    await mongoose.connection.close();
    process.exit(0);
});

app.listen(3000, () => {
    console.log("Server is running on port 3000");
    console.log('Data will be saved to MongoDB');
});