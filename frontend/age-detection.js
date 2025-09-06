// Age Detection for Content Mode Switching
class AgeDetectionManager {
    constructor() {
        this.currentMode = 'adult'; // default
        this.video = null;
        this.stream = null;
        this.isDetecting = false;
        this.geminiApiKey = 'AIzaSyBqcpbnL6MbWkm7D-qx8nYyDDCa004Uh_A';
        this.init();
    }

    async init() {
        // Skip face detection for now, show manual selector
        this.showManualModeSelector();
        this.initializeGeminiAPI();
    }

    initializeGeminiAPI() {
        // Initialize Gemini API for content generation
        this.setupAIButtons();
    }

    setupAIButtons() {
        // Setup AI report generation
        const reportBtn = document.getElementById('generateReportBtn');
        if (reportBtn) {
            reportBtn.addEventListener('click', () => this.generateAIReport());
        }
        
        const suggestionsBtn = document.getElementById('getSuggestionsBtn');
        if (suggestionsBtn) {
            suggestionsBtn.addEventListener('click', () => this.getAISuggestions());
        }
    }

    async startCamera() {
        this.video = document.createElement('video');
        this.video.style.display = 'none';
        document.body.appendChild(this.video);

        this.stream = await navigator.mediaDevices.getUserMedia({ video: true });
        this.video.srcObject = this.stream;
        await this.video.play();
    }

    startDetection() {
        if (this.isDetecting) return;
        this.isDetecting = true;

        setInterval(async () => {
            try {
                const detections = await faceapi
                    .detectAllFaces(this.video, new faceapi.TinyFaceDetectorOptions())
                    .withAgeAndGender();

                if (detections.length === 1) {
                    const age = detections[0].age;
                    const newMode = age < 13 ? 'child' : 'adult';
                    
                    if (newMode !== this.currentMode) {
                        this.switchMode(newMode);
                    }
                }
            } catch (error) {
                console.log('Detection error:', error);
            }
        }, 2000);
    }

    switchMode(mode) {
        this.currentMode = mode;
        
        if (mode === 'child') {
            this.enableKidsMode();
        } else {
            this.enableAdultMode();
        }
    }

    enableKidsMode() {
        console.log('Kids Mode Activated');
        document.body.classList.add('kids-mode');
        document.body.classList.remove('adult-mode');
        
        // Hide sensitive content
        document.querySelectorAll('.adult-content').forEach(el => {
            el.style.display = 'none';
        });
        
        // Show kid-friendly message
        this.showModeIndicator('🧒 Kids Mode Active');
    }

    enableAdultMode() {
        console.log('Adult Mode Activated');
        document.body.classList.add('adult-mode');
        document.body.classList.remove('kids-mode');
        
        // Show all content
        document.querySelectorAll('.adult-content').forEach(el => {
            el.style.display = 'block';
        });
        
        this.showModeIndicator('👤 Adult Mode Active');
    }

    showModeIndicator(text) {
        let indicator = document.getElementById('mode-indicator');
        if (!indicator) {
            indicator = document.createElement('div');
            indicator.id = 'mode-indicator';
            indicator.style.cssText = `
                position: fixed;
                top: 10px;
                right: 10px;
                background: var(--gold);
                color: white;
                padding: 8px 16px;
                border-radius: 20px;
                font-size: 12px;
                z-index: 1000;
                font-weight: 600;
            `;
            document.body.appendChild(indicator);
        }
        indicator.textContent = text;
    }

    showManualModeSelector() {
        const selector = document.createElement('div');
        selector.id = 'mode-selector';
        selector.innerHTML = `
            <div style="position: fixed; top: 20px; right: 20px; 
                        background: var(--gold); padding: 15px; border-radius: 15px; 
                        box-shadow: 0 4px 20px rgba(255,215,0,0.3); z-index: 10000; color: white;">
                <h4 style="margin: 0 0 10px 0; text-align: center;">Content Mode</h4>
                <button onclick="window.ageDetector.switchMode('child')" 
                        style="margin: 5px; padding: 8px 15px; border: none; border-radius: 8px; cursor: pointer; background: #fff; color: var(--gold); font-weight: bold;">🧒 Kids Mode</button>
                <button onclick="window.ageDetector.switchMode('adult')" 
                        style="margin: 5px; padding: 8px 15px; border: none; border-radius: 8px; cursor: pointer; background: #fff; color: var(--gold); font-weight: bold;">👤 Adult Mode</button>
            </div>
        `;
        document.body.appendChild(selector);
    }

    async generateAIReport() {
        const btn = document.getElementById('generateReportBtn');
        const container = document.getElementById('aiReportContainer');
        
        if (!btn || !container) return;
        
        btn.textContent = '🔮 Generating...';
        btn.disabled = true;
        container.innerHTML = '<p style="text-align: center;">🤖 AI Oracle is analyzing your digital wellness...</p>';
        
        try {
            const report = await this.callGeminiAPI('Generate a personalized mental wellness report based on digital content consumption. Include insights about mood patterns, content balance, and recommendations for better digital wellness. Make it spiritual and encouraging.');
            
            container.innerHTML = `<div class="ai-report">${report.replace(/\n/g, '<br>')}</div>`;
        } catch (error) {
            container.innerHTML = '<p style="color: #f44336;">🔮 The Oracle is temporarily unavailable. Please try again later.</p>';
        }
        
        btn.textContent = '🔮 Generate Wisdom';
        btn.disabled = false;
    }
    
    async getAISuggestions() {
        const btn = document.getElementById('getSuggestionsBtn');
        const container = document.getElementById('aiSuggestionsContainer');
        
        if (!btn || !container) return;
        
        btn.textContent = '💫 Loading...';
        btn.disabled = true;
        container.innerHTML = '<p style="text-align: center;">🤖 AI is creating personalized guidance...</p>';
        
        try {
            const suggestions = await this.callGeminiAPI('Create 4 personalized wellness suggestions for digital mental health. Include morning rituals, evening practices, mindfulness techniques, and content curation tips. Format as practical actionable advice.');
            
            const suggestionsList = suggestions.split('\n').filter(s => s.trim()).slice(0, 4);
            
            container.innerHTML = suggestionsList.map((suggestion, index) => `
                <div class="suggestion-card">
                    <h4>${['🌅 Morning Ritual', '🌙 Evening Practice', '🧘 Mindfulness Technique', '📱 Content Curation'][index] || '💡 Wellness Tip'}</h4>
                    <p>${suggestion}</p>
                </div>
            `).join('');
        } catch (error) {
            container.innerHTML = '<p style="color: #f44336;">💫 Divine guidance temporarily unavailable. Please try again.</p>';
        }
        
        btn.textContent = '💫 Get Guidance';
        btn.disabled = false;
    }
    
    async callGeminiAPI(prompt) {
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${this.geminiApiKey}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                contents: [{
                    parts: [{
                        text: prompt
                    }]
                }]
            })
        });
        
        const data = await response.json();
        return data.candidates[0].content.parts[0].text;
    }

    cleanup() {
        if (this.stream) {
            this.stream.getTracks().forEach(track => track.stop());
        }
        if (this.video) {
            this.video.remove();
        }
        this.isDetecting = false;
    }
}

// Initialize age detection
window.ageDetector = null;
document.addEventListener('DOMContentLoaded', () => {
    window.ageDetector = new AgeDetectionManager();
});