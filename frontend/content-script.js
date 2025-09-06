// Content script to analyze social media content
console.log('Manorakshak: Content script loaded on', window.location.hostname);

let isAnalyzing = false;
let processedElements = new Set();
let extensionValid = true;

// Check if extension context is still valid
function checkExtensionContext() {
    try {
        if (typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.id) {
            return true;
        }
    } catch (error) {
        extensionValid = false;
        return false;
    }
    return false;
}

function getPlatform() {
    const hostname = window.location.hostname;
    if (hostname.includes('instagram')) return 'Instagram';
    if (hostname.includes('youtube')) return 'YouTube';
    if (hostname.includes('facebook')) return 'Facebook';
    if (hostname.includes('twitter') || hostname.includes('x.com')) return 'Twitter';
    return 'Unknown';
}

function getCurrentVideoData() {
    const videoData = {
        title: '',
        description: '',
        channel: '',
        duration: 0,
        url: window.location.href
    };
    
    try {
        // Get video title
        const titleEl = document.querySelector('h1.ytd-video-primary-info-renderer, h1.title, ytd-video-primary-info-renderer h1');
        if (titleEl) {
            videoData.title = titleEl.textContent.trim();
        }
        
        // Get channel name
        const channelEl = document.querySelector('#channel-name a, ytd-video-owner-renderer #channel-name a, .ytd-channel-name a');
        if (channelEl) {
            videoData.channel = channelEl.textContent.trim();
        }
        
        // Get video description
        const descEl = document.querySelector('#description-text, ytd-video-secondary-info-renderer #description-text, .ytd-video-secondary-info-renderer #description');
        if (descEl) {
            videoData.description = descEl.textContent.trim();
        }
        
        // Get video duration (if available)
        const durationEl = document.querySelector('.ytp-time-duration, .ytd-thumbnail-overlay-time-status-renderer');
        if (durationEl) {
            const durationText = durationEl.textContent.trim();
            videoData.duration = parseDuration(durationText);
        }
        
    } catch (error) {
        console.log('Manorakshak: Error getting video data:', error);
    }
    
    return videoData;
}

function parseDuration(durationText) {
    // Parse duration like "10:30" or "1:23:45" to seconds
    const parts = durationText.split(':').map(Number);
    if (parts.length === 2) {
        return parts[0] * 60 + parts[1];
    } else if (parts.length === 3) {
        return parts[0] * 3600 + parts[1] * 60 + parts[2];
    }
    return 0;
}

function analyzeContent() {
    if (isAnalyzing) return;
    isAnalyzing = true;
    
    console.log('Manorakshak: Analyzing content...');
    const platform = getPlatform();
    const content = getContentFromPage();
    
    content.forEach(item => {
        if (item.text && item.text.length > 5 && !processedElements.has(item.id)) {
            console.log('Manorakshak: Found content:', item.text.substring(0, 50));
            sendToBackend(item.text, platform, item.type || 'general', item);
            processedElements.add(item.id);
        }
    });
    
    setTimeout(() => { isAnalyzing = false; }, 1000);
}

function getContentFromPage() {
    let content = [];
    const platform = getPlatform();
    
    try {
        if (platform === 'YouTube') {
            // Get current video information if on a video page
            if (window.location.pathname.includes('/watch')) {
                const videoData = getCurrentVideoData();
                if (videoData.title) {
                    content.push({
                        text: videoData.title,
                        id: 'yt-current-title-' + Date.now(),
                        type: 'video_title',
                        videoData: videoData
                    });
                }
                if (videoData.description) {
                    content.push({
                        text: videoData.description,
                        id: 'yt-current-desc-' + Date.now(),
                        type: 'video_description',
                        videoData: videoData
                    });
                }
            }
            
            // Video titles from feed/grid
            const titles = document.querySelectorAll('h1.ytd-video-primary-info-renderer, #video-title, a#video-title, .ytd-rich-grid-media #video-title, ytd-video-renderer #video-title, ytd-rich-item-renderer #video-title');
            titles.forEach((title, index) => {
                if (title.textContent.trim()) {
                    const channelEl = title.closest('ytd-video-renderer, ytd-rich-item-renderer, ytd-grid-video-renderer')?.querySelector('#channel-name, .ytd-channel-name a, ytd-channel-name a');
                    const channel = channelEl ? channelEl.textContent.trim() : 'Unknown Channel';
                    
                    content.push({
                        text: title.textContent.trim(),
                        id: 'yt-title-' + index + '-' + title.textContent.length,
                        type: 'video_title',
                        channel: channel
                    });
                }
            });
            
            // Comments
            const comments = document.querySelectorAll('#content-text, .ytd-comment-renderer #content-text, ytd-comment-thread-renderer #content-text');
            comments.forEach((comment, index) => {
                if (comment.textContent.trim() && comment.textContent.length > 10) {
                    content.push({
                        text: comment.textContent.trim(),
                        id: 'yt-comment-' + index + '-' + comment.textContent.length,
                        type: 'comment'
                    });
                }
            });
            
            // Video descriptions
            const descriptions = document.querySelectorAll('.ytd-video-secondary-info-renderer #description, #description-text, ytd-video-secondary-info-renderer #description-text');
            descriptions.forEach((desc, index) => {
                if (desc.textContent.trim()) {
                    content.push({
                        text: desc.textContent.trim().substring(0, 200),
                        id: 'yt-desc-' + index + '-' + desc.textContent.length,
                        type: 'video_description'
                    });
                }
            });
        }
        
        if (platform === 'Instagram') {
            // Instagram captions
            const captions = document.querySelectorAll('article span, [data-testid="post-caption"], .x1lliihq span, ._a9zs span');
            captions.forEach((caption, index) => {
                if (caption.textContent.trim() && caption.textContent.length > 10) {
                    content.push({
                        text: caption.textContent.trim(),
                        id: 'ig-caption-' + index + '-' + caption.textContent.length
                    });
                }
            });
            
            // Instagram comments
            const comments = document.querySelectorAll('._a9zs, .C4VMK span, [role="button"] span');
            comments.forEach((comment, index) => {
                if (comment.textContent.trim() && comment.textContent.length > 5) {
                    content.push({
                        text: comment.textContent.trim(),
                        id: 'ig-comment-' + index + '-' + comment.textContent.length
                    });
                }
            });
        }
        
        if (platform === 'Facebook') {
            // Facebook posts
            const posts = document.querySelectorAll('[data-testid="post_message"], .userContent, .x1iorvi4 span');
            posts.forEach((post, index) => {
                if (post.textContent.trim() && post.textContent.length > 10) {
                    content.push({
                        text: post.textContent.trim(),
                        id: 'fb-post-' + index + '-' + post.textContent.length
                    });
                }
            });
        }
        
        if (platform === 'Twitter') {
            // Twitter tweets
            const tweets = document.querySelectorAll('[data-testid="tweetText"], .tweet-text, [lang] span');
            tweets.forEach((tweet, index) => {
                if (tweet.textContent.trim() && tweet.textContent.length > 10) {
                    content.push({
                        text: tweet.textContent.trim(),
                        id: 'tw-tweet-' + index + '-' + tweet.textContent.length
                    });
                }
            });
        }
        
        console.log(`Manorakshak: Found ${content.length} content items on ${platform}`);
        
    } catch (error) {
        console.log('Manorakshak: Content extraction error:', error);
    }
    
    return content;
}

async function sendToBackend(text, platform, contentType = 'general', additionalData = {}) {
    if (!extensionValid || !checkExtensionContext()) {
        console.log('Manorakshak: Extension context invalidated, stopping');
        return;
    }
    
    try {
        console.log('Manorakshak: Sending to backend:', text.substring(0, 30));
        
        const payload = { 
            text, 
            platform, 
            contentType,
            ...additionalData
        };
        
        const response = await fetch('http://localhost:3000/api/analyze-content', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
        
        const result = await response.json();
        console.log('Manorakshak: Backend response:', result);
        
        // If this is video content, also send to video history
        if (contentType === 'video_title' && additionalData.videoData) {
            await sendVideoToHistory(additionalData.videoData, result.sentiment);
        }
        
        // Add alert for negative content
        if (result.sentiment === 'toxic' || result.sentiment === 'negative') {
            await fetch('http://localhost:3000/api/add-alert', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    message: `${result.sentiment} content detected: "${text.substring(0, 30)}..."`,
                    type: result.sentiment === 'toxic' ? 'critical' : 'warning',
                    platform
                })
            });
        }
    } catch (error) {
        if (error.message && error.message.includes('Extension context invalidated')) {
            extensionValid = false;
            console.log('Manorakshak: Extension reloaded, stopping content script');
            return;
        }
        console.log('Manorakshak: Backend communication error:', error);
    }
}

async function sendVideoToHistory(videoData, sentiment) {
    try {
        const category = categorizeVideo(videoData.title, videoData.description);
        
        await fetch('http://localhost:3000/api/video-history', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                title: videoData.title,
                description: videoData.description,
                channel: videoData.channel,
                duration: videoData.duration,
                category: category,
                sentiment: sentiment,
                platform: 'YouTube',
                url: videoData.url
            })
        });
        
        console.log('Manorakshak: Video added to history:', videoData.title);
    } catch (error) {
        console.log('Manorakshak: Failed to add video to history:', error);
    }
}

function categorizeVideo(title, description) {
    const text = (title + ' ' + description).toLowerCase();
    
    if (text.includes('tutorial') || text.includes('how to') || text.includes('learn') || text.includes('education')) {
        return 'Education';
    } else if (text.includes('music') || text.includes('song') || text.includes('concert')) {
        return 'Music';
    } else if (text.includes('gaming') || text.includes('game') || text.includes('play')) {
        return 'Gaming';
    } else if (text.includes('news') || text.includes('breaking') || text.includes('update')) {
        return 'News';
    } else if (text.includes('comedy') || text.includes('funny') || text.includes('joke')) {
        return 'Entertainment';
    } else if (text.includes('cooking') || text.includes('recipe') || text.includes('food')) {
        return 'Lifestyle';
    } else if (text.includes('fitness') || text.includes('workout') || text.includes('exercise')) {
        return 'Health';
    } else if (text.includes('travel') || text.includes('vlog') || text.includes('adventure')) {
        return 'Travel';
    } else {
        return 'General';
    }
}

// Start analyzing when page loads
setTimeout(() => {
    console.log('Manorakshak: Starting initial analysis');
    analyzeContent();
}, 2000);

// Analyze new content as user scrolls
let scrollTimeout;
window.addEventListener('scroll', () => {
    clearTimeout(scrollTimeout);
    scrollTimeout = setTimeout(analyzeContent, 1000);
});

// Analyze new content periodically
let analysisInterval = setInterval(() => {
    if (!extensionValid) {
        clearInterval(analysisInterval);
        return;
    }
    console.log('Manorakshak: Periodic analysis');
    analyzeContent();
}, 3000);

// Calm Mode functionality
let calmModeActive = false;

async function checkCalmMode() {
    if (!extensionValid || !checkExtensionContext()) {
        return;
    }
    
    try {
        const response = await fetch('http://localhost:3000/api/dashboard');
        if (response.ok) {
            const data = await response.json();
            console.log('Manorakshak: Calm mode status:', data.calmMode);
            
            if (data.calmMode !== calmModeActive) {
                calmModeActive = data.calmMode;
                toggleCalmMode(calmModeActive);
            }
        }
    } catch (error) {
        if (error.message && error.message.includes('Extension context invalidated')) {
            extensionValid = false;
            return;
        }
        console.log('Manorakshak: Calm mode check failed:', error);
    }
}

function toggleCalmMode(enabled) {
    console.log('Manorakshak: Calm mode', enabled ? 'enabled' : 'disabled');
    
    if (enabled) {
        hideYouTubeRecommendations();
        showCalmModeMessage();
    } else {
        showYouTubeRecommendations();
        hideCalmModeMessage();
    }
}

function hideYouTubeRecommendations() {
    const style = document.getElementById('manorakshak-calm-style') || document.createElement('style');
    style.id = 'manorakshak-calm-style';
    style.textContent = `
        /* Hide home feed */
        ytd-browse[page-subtype="home"] #contents,
        ytd-rich-grid-renderer,
        ytd-rich-section-renderer,
        
        /* Hide sidebar recommendations */
        #secondary #related,
        ytd-watch-next-secondary-results-renderer,
        
        /* Hide suggested videos */
        .ytp-endscreen-content,
        .ytp-ce-element,
        
        /* Hide trending and explore */
        ytd-browse[page-subtype="trending"] #contents,
        ytd-browse[page-subtype="explore"] #contents {
            display: none !important;
        }
        
        /* Show calm mode indicator */
        #manorakshak-calm-indicator {
            display: block !important;
        }
    `;
    document.head.appendChild(style);
    
    // Show goal-based suggestions
    showGoalBasedSuggestions();
}

async function showGoalBasedSuggestions() {
    try {
        const response = await fetch('http://localhost:3000/api/dashboard');
        const data = await response.json();
        
        if (data.goals && data.goals.length > 0) {
            createGoalSuggestions(data.goals);
        }
    } catch (error) {
        console.log('Manorakshak: Goal suggestions failed:', error);
    }
}

function createGoalSuggestions(goals) {
    if (document.getElementById('manorakshak-goal-suggestions')) return;
    
    const suggestions = document.createElement('div');
    suggestions.id = 'manorakshak-goal-suggestions';
    suggestions.innerHTML = `
        <div style="
            position: fixed;
            top: 80px;
            right: 20px;
            background: white;
            padding: 20px;
            border-radius: 15px;
            box-shadow: 0 8px 32px rgba(0,0,0,0.1);
            z-index: 9999;
            max-width: 300px;
            border-left: 4px solid #d4a017;
        ">
            <h3 style="margin: 0 0 15px 0; color: #d4a017;">🎯 Your Goals</h3>
            ${goals.map(goal => `
                <div style="
                    background: #f8f9fa;
                    padding: 10px;
                    border-radius: 8px;
                    margin-bottom: 10px;
                    cursor: pointer;
                " onclick="window.open('https://youtube.com/results?search_query=${encodeURIComponent(goal.goal)}', '_self')">
                    <strong>${goal.goal}</strong><br>
                    <small style="color: #666;">Click to search related content</small>
                </div>
            `).join('')}
        </div>
    `;
    document.body.appendChild(suggestions);
}

function showYouTubeRecommendations() {
    const style = document.getElementById('manorakshak-calm-style');
    if (style) style.remove();
}

function showCalmModeMessage() {
    if (document.getElementById('manorakshak-calm-indicator')) return;
    
    const indicator = document.createElement('div');
    indicator.id = 'manorakshak-calm-indicator';
    indicator.innerHTML = `
        <div style="
            position: fixed;
            top: 20px;
            right: 20px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 15px 20px;
            border-radius: 10px;
            box-shadow: 0 4px 15px rgba(0,0,0,0.2);
            z-index: 9999;
            font-family: Arial, sans-serif;
            font-size: 14px;
            display: none;
        ">
            🧘 <strong>Calm Mode Active</strong><br>
            <small>Distractions hidden for mindful browsing</small>
        </div>
    `;
    document.body.appendChild(indicator);
}

function hideCalmModeMessage() {
    const indicator = document.getElementById('manorakshak-calm-indicator');
    if (indicator) indicator.remove();
    
    const suggestions = document.getElementById('manorakshak-goal-suggestions');
    if (suggestions) suggestions.remove();
}

// Check calm mode status periodically
let calmModeInterval = setInterval(() => {
    if (!extensionValid) {
        clearInterval(calmModeInterval);
        return;
    }
    checkCalmMode();
}, 2000);

setTimeout(checkCalmMode, 1000);

// Listen for YouTube navigation changes
let currentUrl = location.href;
let navigationInterval = setInterval(() => {
    if (!extensionValid) {
        clearInterval(navigationInterval);
        return;
    }
    
    if (location.href !== currentUrl) {
        currentUrl = location.href;
        console.log('Manorakshak: Page changed, analyzing new content');
        processedElements.clear();
        setTimeout(analyzeContent, 1000);
        setTimeout(() => toggleCalmMode(calmModeActive), 500);
    }
}, 1000);

// === GOAL-BASED YOUTUBE FILTERING ===

let savedGoals = [];

function fetchGoalsAndFilter() {
    if (!extensionValid || !checkExtensionContext()) {
        return;
    }
    
    try {
        if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
            chrome.storage.local.get(['goals'], (result) => {
                if (chrome.runtime.lastError) {
                    console.log('Manorakshak: Storage access failed');
                    return;
                }
                savedGoals = (result.goals || []).map(g => g.goal ? g.goal : g).filter(Boolean);
                filterYouTubeFeed();
            });
        } else {
            savedGoals = [];
        }
    } catch (error) {
        if (error.message && error.message.includes('Extension context invalidated')) {
            extensionValid = false;
        }
        savedGoals = [];
    }
}

function filterYouTubeFeed() {
    if (!Array.isArray(savedGoals) || savedGoals.length === 0) return;
    // Lowercase all goal keywords for case-insensitive match
    const goalKeywords = savedGoals.map(g => g.toLowerCase());

    // Helper: check if any goal matches text
    function matchesGoal(text) {
        if (!text) return false;
        const lower = text.toLowerCase();
        return goalKeywords.some(goal => lower.includes(goal));
    }

    // --- Homepage & Recommended Feed ---
    // Video grid items
    document.querySelectorAll('ytd-rich-item-renderer, ytd-video-renderer, ytd-grid-video-renderer, ytd-reel-video-renderer, ytd-compact-video-renderer').forEach(el => {
        // Title
        let title = '';
        let channel = '';
        // Try to get title
        const titleEl = el.querySelector('#video-title') || el.querySelector('a#video-title') || el.querySelector('yt-formatted-string.title');
        if (titleEl) title = titleEl.textContent.trim();
        // Try to get channel name
        const channelEl = el.querySelector('ytd-channel-name, .ytd-channel-name, #channel-name, .channel-name');
        if (channelEl) channel = channelEl.textContent.trim();
        // If neither matches, hide
        if (!matchesGoal(title) && !matchesGoal(channel)) {
            el.style.display = 'none';
        } else {
            el.style.display = '';
        }
    });

    // --- Shorts ---
    document.querySelectorAll('ytd-reel-item-renderer, ytd-reel-video-renderer').forEach(el => {
        let title = '';
        let channel = '';
        const titleEl = el.querySelector('#video-title') || el.querySelector('a#video-title') || el.querySelector('yt-formatted-string.title');
        if (titleEl) title = titleEl.textContent.trim();
        const channelEl = el.querySelector('ytd-channel-name, .ytd-channel-name, #channel-name, .channel-name');
        if (channelEl) channel = channelEl.textContent.trim();
        if (!matchesGoal(title) && !matchesGoal(channel)) {
            el.style.display = 'none';
        } else {
            el.style.display = '';
        }
    });
}

// Observe DOM changes to re-apply filtering
let ytGoalFilterObserver = null;
function startYouTubeGoalFilterObserver() {
    if (ytGoalFilterObserver) return;
    const target = document.body;
    ytGoalFilterObserver = new MutationObserver((mutations) => {
        // Only re-filter if video elements are added/removed
        for (const m of mutations) {
            if (m.addedNodes.length || m.removedNodes.length) {
                filterYouTubeFeed();
                break;
            }
        }
    });
    ytGoalFilterObserver.observe(target, { childList: true, subtree: true });
}

// Initial fetch and filter
if (window.location.hostname.includes('youtube.com')) {
    fetchGoalsAndFilter();
    startYouTubeGoalFilterObserver();
    // Also re-fetch goals every 10s in case popup changes them
    let goalsInterval = setInterval(() => {
        if (!extensionValid) {
            clearInterval(goalsInterval);
            return;
        }
        fetchGoalsAndFilter();
    }, 10000);
}