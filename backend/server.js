const express = require('express');
const mongoose = require('mongoose');
const app = express();

// Gemini AI setup (optional)
let genAI = null;
let model = null;

try {
    const { GoogleGenerativeAI } = require('@google/generative-ai');
    const GEMINI_API_KEY = 'AIzaSyBqcpbnL6MbWkm7D-qx8nYyDDCa004Uh_A';
    
    genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
    model = genAI.getGenerativeModel({ model: 'gemini-pro' });
    console.log('✅ Gemini AI initialized successfully');
} catch (error) {
    console.log('❌ Gemini AI initialization failed:', error.message);
    console.log('Install: npm install @google/generative-ai');
}

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
    videoHistory: { type: Array, default: [] },
    lastUpdated: { type: Date, default: Date.now }
});

const UserData = mongoose.model('UserData', userDataSchema);

// MongoDB connection
const MONGODB_URI = 'mongodb+srv://Chaman:9783948864@manorakshak.6cg475o.mongodb.net/manorakshak?retryWrites=true&w=majority&appName=MANORAKSHAK';

let userData = {
    moodScore: 60,
    sentimentTrend: [45, 52, 48, 65, 70, 58, 60],
    contentBreakdown: { uplifting: 40, negative: 25, neutral: 30, toxic: 5 },
    alerts: [],
    calmMode: false,
    goals: [],
    insights: [],
    analyzedContent: [],
    videoHistory: []
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

app.post('/api/generate-report', async (req, res) => {
    try {
        const report = await generateAIReport();
        res.json({ report, success: true });
    } catch (error) {
        res.json({ error: error.message, success: false });
    }
});

app.post('/api/get-suggestions', async (req, res) => {
    try {
        const suggestions = await generateAISuggestions();
        res.json({ suggestions, success: true });
    } catch (error) {
        res.json({ error: error.message, success: false });
    }
});

app.post('/api/summarize-content', async (req, res) => {
    try {
        const { content } = req.body;
        const summary = await summarizeWithAI(content);
        res.json({ summary, success: true });
    } catch (error) {
        res.json({ error: error.message, success: false });
    }
});

app.post('/api/video-history', (req, res) => {
    const { title, duration, category, sentiment, platform } = req.body;
    
    const videoEntry = {
        id: Date.now(),
        title: title || 'Unknown Video',
        duration: duration || 0,
        category: category || 'General',
        sentiment: sentiment || 'neutral',
        platform: platform || 'YouTube',
        timestamp: new Date(),
        date: new Date().toISOString().slice(0, 10)
    };
    
    userData.videoHistory.push(videoEntry);
    
    // Keep only last 100 videos
    if (userData.videoHistory.length > 100) {
        userData.videoHistory = userData.videoHistory.slice(-100);
    }
    
    saveUserData();
    res.json({ success: true, video: videoEntry });
});

app.get('/api/video-analytics', (req, res) => {
    const analytics = generateVideoAnalytics();
    res.json(analytics);
});

function analyzeText(text) {
    const positiveWords = ['happy', 'good', 'great', 'amazing', 'love', 'wonderful', 'excellent', 'awesome', 'fantastic', 'beautiful', 'inspiring', 'motivational', 'success', 'win', 'joy', 'smile', 'laugh', 'fun', 'celebrate', 'achievement', 'proud', 'blessed', 'grateful', 'positive', 'hope', 'dream', 'peace', 'calm', 'relax'];
    
    const negativeWords = ['sad', 'bad', 'hate', 'terrible', 'awful', 'horrible', 'depressed', 'angry', 'mad', 'upset', 'cry', 'tears', 'pain', 'hurt', 'broken', 'lonely', 'scared', 'fear', 'worry', 'stress', 'anxiety', 'fail', 'failure', 'lose', 'lost', 'disappointed', 'regret', 'sorry', 'mistake', 'wrong', 'problem', 'issue', 'trouble', 'difficult', 'hard', 'struggle', 'suffer', 'sick', 'tired', 'exhausted'];
    
    const toxicWords = ['kill', 'die', 'death', 'murder', 'suicide', 'stupid', 'idiot', 'dumb', 'moron', 'fool', 'loser', 'ugly', 'fat', 'worthless', 'useless', 'pathetic', 'disgusting', 'gross', 'nasty', 'creepy', 'weird', 'freak', 'psycho', 'crazy', 'insane', 'retard', 'gay', 'lesbian', 'homo', 'fag', 'slut', 'whore', 'bitch', 'bastard', 'damn', 'hell', 'shit', 'fuck', 'violence', 'fight', 'punch', 'kick', 'beat', 'attack', 'assault', 'abuse', 'bully', 'threat', 'dangerous', 'weapon', 'gun', 'knife', 'bomb', 'terrorist', 'war', 'blood', 'gore'];
    
    const fightingWords = ['fight', 'fighting', 'combat', 'battle', 'war', 'boxing', 'mma', 'ufc', 'wrestling', 'martial arts', 'karate', 'punch', 'kick', 'knockout', 'ko', 'submission', 'takedown', 'grappling', 'sparring', 'tournament', 'championship', 'versus', 'vs', 'opponent', 'fighter', 'warrior', 'gladiator', 'arena', 'octagon', 'ring', 'match', 'bout', 'round'];
    
    const words = text.toLowerCase().split(/\s+/);
    let positive = 0, negative = 0, toxic = 0, fighting = 0;
    
    // Check if content matches user goals
    const goalMatch = checkGoalAlignment(text);
    
    words.forEach(word => {
        // Remove punctuation for better matching
        const cleanWord = word.replace(/[^a-zA-Z]/g, '');
        
        if (positiveWords.includes(cleanWord)) positive++;
        if (negativeWords.includes(cleanWord)) negative++;
        if (toxicWords.includes(cleanWord)) toxic++;
        if (fightingWords.includes(cleanWord)) fighting++;
    });
    
    // Enhanced sentiment logic
    if (toxic > 0) return 'toxic';
    if (fighting > 1) return 'negative'; // Fighting content is negative
    if (goalMatch) return 'positive'; // Goal-aligned content is positive
    if (positive > negative + 1) return 'positive';
    if (negative > positive + 1) return 'negative';
    if (positive > 0 && negative === 0) return 'positive';
    if (negative > 0 && positive === 0) return 'negative';
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

async function generateAIReport() {
    if (!model) {
        return `Mental Wellbeing Report\n\nCurrent Status: Your mood score is ${userData.moodScore}% today.\n\nContent Analysis: You've consumed ${userData.contentBreakdown.uplifting} positive posts, ${userData.contentBreakdown.negative} negative posts, and ${userData.contentBreakdown.toxic} toxic posts.\n\nRecommendation: ${userData.moodScore > 70 ? 'Keep up the positive content consumption!' : 'Consider using Calm Mode and following more positive accounts.'}`;
    }
    
    const total = Object.values(userData.contentBreakdown).reduce((a, b) => a + b, 0);
    const recentContent = userData.analyzedContent.slice(-20).map(c => c.text).join('. ');
    
    const prompt = `
    Generate a mental wellbeing report based on this data:
    - Mood Score: ${userData.moodScore}%
    - Content Breakdown: ${userData.contentBreakdown.uplifting} positive, ${userData.contentBreakdown.negative} negative, ${userData.contentBreakdown.toxic} toxic
    - Goals: ${userData.goals.map(g => g.goal).join(', ')}
    - Recent Content Sample: ${recentContent.substring(0, 500)}
    
    Provide a 3-paragraph report covering:
    1. Current mental health status
    2. Content consumption patterns
    3. Recommendations for improvement
    `;
    
    try {
        const result = await model.generateContent(prompt);
        return result.response.text();
    } catch (error) {
        return 'AI report generation temporarily unavailable. Your mood score is ' + userData.moodScore + '% today.';
    }
}

async function generateAISuggestions() {
    const fallbackSuggestions = [
        { title: 'Take Regular Breaks', description: 'Step away from screens every 30 minutes' },
        { title: 'Curate Your Feed', description: 'Unfollow accounts that post negative content' },
        { title: 'Set Time Limits', description: 'Use app timers to limit social media usage' },
        { title: 'Practice Mindfulness', description: 'Be conscious of how content makes you feel' },
        { title: 'Engage Positively', description: 'Like and share uplifting content' }
    ];
    
    if (!model) {
        return fallbackSuggestions;
    }
    
    const prompt = `
    Based on this mental wellbeing data, provide 5 specific actionable suggestions:
    - Current mood score: ${userData.moodScore}%
    - Goals: ${userData.goals.map(g => g.goal).join(', ')}
    - Negative content: ${userData.contentBreakdown.negative}%
    - Toxic content: ${userData.contentBreakdown.toxic}%
    
    Format as JSON array with objects containing 'title' and 'description' fields.
    Focus on practical digital wellness tips.
    `;
    
    try {
        const result = await model.generateContent(prompt);
        const text = result.response.text();
        try {
            return JSON.parse(text);
        } catch {
            return fallbackSuggestions;
        }
    } catch (error) {
        return fallbackSuggestions;
    }
}

async function summarizeWithAI(content) {
    if (!model) {
        return content.length > 100 ? content.substring(0, 100) + '...' : content;
    }
    
    const prompt = `Summarize this social media content in 2-3 sentences, focusing on the main sentiment and key points: ${content}`;
    
    try {
        const result = await model.generateContent(prompt);
        return result.response.text();
    } catch (error) {
        return content.length > 100 ? content.substring(0, 100) + '...' : content;
    }
}

function generateVideoAnalytics() {
    const videos = userData.videoHistory || [];
    
    if (videos.length === 0) {
        return {
            totalVideos: 0,
            totalWatchTime: 0,
            categoryBreakdown: {},
            sentimentBreakdown: { positive: 0, negative: 0, neutral: 0, toxic: 0 },
            dailyStats: [],
            platformStats: {},
            weeklyTrend: []
        };
    }
    
    // Calculate total stats
    const totalVideos = videos.length;
    const totalWatchTime = videos.reduce((sum, v) => sum + (v.duration || 0), 0);
    
    // Category breakdown
    const categoryBreakdown = {};
    videos.forEach(v => {
        categoryBreakdown[v.category] = (categoryBreakdown[v.category] || 0) + 1;
    });
    
    // Sentiment breakdown
    const sentimentBreakdown = { positive: 0, negative: 0, neutral: 0, toxic: 0 };
    videos.forEach(v => {
        sentimentBreakdown[v.sentiment] = (sentimentBreakdown[v.sentiment] || 0) + 1;
    });
    
    // Platform stats
    const platformStats = {};
    videos.forEach(v => {
        platformStats[v.platform] = (platformStats[v.platform] || 0) + 1;
    });
    
    // Daily stats for last 7 days
    const dailyStats = [];
    const today = new Date();
    
    for (let i = 6; i >= 0; i--) {
        const date = new Date(today);
        date.setDate(date.getDate() - i);
        const dateStr = date.toISOString().slice(0, 10);
        
        const dayVideos = videos.filter(v => v.date === dateStr);
        const dayWatchTime = dayVideos.reduce((sum, v) => sum + (v.duration || 0), 0);
        
        dailyStats.push({
            date: dateStr,
            videos: dayVideos.length,
            watchTime: dayWatchTime,
            avgSentiment: calculateAvgSentiment(dayVideos)
        });
    }
    
    // Weekly trend
    const weeklyTrend = dailyStats.map(day => ({
        date: day.date,
        value: day.videos
    }));
    
    return {
        totalVideos,
        totalWatchTime,
        categoryBreakdown,
        sentimentBreakdown,
        dailyStats,
        platformStats,
        weeklyTrend
    };
}

function calculateAvgSentiment(videos) {
    if (videos.length === 0) return 50;
    
    const sentimentScores = {
        positive: 80,
        neutral: 50,
        negative: 20,
        toxic: 10
    };
    
    const totalScore = videos.reduce((sum, v) => sum + (sentimentScores[v.sentiment] || 50), 0);
    return Math.round(totalScore / videos.length);
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