// Content script to analyze YouTube content
console.log('Manorakshak: Content script loaded on', window.location.hostname);

let isAnalyzing = false;
let processedElements = new Set();

function analyzeContent() {
    if (isAnalyzing) return;
    isAnalyzing = true;
    
    console.log('Manorakshak: Analyzing content...');
    const platform = 'YouTube';
    const content = getYouTubeContent();
    
    content.forEach(item => {
        if (item.text && item.text.length > 5 && !processedElements.has(item.id)) {
            console.log('Manorakshak: Found content:', item.text.substring(0, 50));
            sendToBackend(item.text, platform);
            processedElements.add(item.id);
        }
    });
    
    setTimeout(() => { isAnalyzing = false; }, 1000);
}

function getYouTubeContent() {
    let content = [];
    
    try {
        // Video titles
        const titles = document.querySelectorAll('h1.ytd-video-primary-info-renderer, #video-title, a#video-title');
        titles.forEach((title, index) => {
            if (title.textContent.trim()) {
                content.push({
                    text: title.textContent.trim(),
                    id: 'title-' + index + '-' + title.textContent.length
                });
            }
        });
        
        // Comments
        const comments = document.querySelectorAll('#content-text, .ytd-comment-renderer #content-text');
        comments.forEach((comment, index) => {
            if (comment.textContent.trim()) {
                content.push({
                    text: comment.textContent.trim(),
                    id: 'comment-' + index + '-' + comment.textContent.length
                });
            }
        });
        
        // Video descriptions
        const descriptions = document.querySelectorAll('.ytd-video-secondary-info-renderer #description, #description-text');
        descriptions.forEach((desc, index) => {
            if (desc.textContent.trim()) {
                content.push({
                    text: desc.textContent.trim().substring(0, 200),
                    id: 'desc-' + index + '-' + desc.textContent.length
                });
            }
        });
        
        console.log('Manorakshak: Found', content.length, 'content items');
        
    } catch (error) {
        console.log('Manorakshak: Content extraction error:', error);
    }
    
    return content;
}

async function sendToBackend(text, platform) {
    try {
        console.log('Manorakshak: Sending to backend:', text.substring(0, 30));
        
        const response = await fetch('http://localhost:3000/api/analyze-content', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ text, platform })
        });
        
        const result = await response.json();
        console.log('Manorakshak: Backend response:', result);
        
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
        console.log('Manorakshak: Backend communication error:', error);
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
setInterval(() => {
    console.log('Manorakshak: Periodic analysis');
    analyzeContent();
}, 3000);

// Calm Mode functionality
let calmModeActive = false;

async function checkCalmMode() {
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
setInterval(checkCalmMode, 2000);
setTimeout(checkCalmMode, 1000);

// Listen for YouTube navigation changes
let currentUrl = location.href;
setInterval(() => {
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
    if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
        chrome.storage.local.get(['goals'], (result) => {
            savedGoals = (result.goals || []).map(g => g.goal ? g.goal : g).filter(Boolean);
            filterYouTubeFeed();
        });
    } else {
        // fallback: no filtering
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
    setInterval(fetchGoalsAndFilter, 10000);
}