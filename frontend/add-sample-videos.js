// Sample Video Data Generator
async function addSampleVideos() {
    const sampleVideos = [
        { title: 'Morning Meditation Guide', duration: 600, category: 'Wellness', sentiment: 'positive', platform: 'YouTube' },
        { title: 'Healthy Cooking Recipe', duration: 480, category: 'Lifestyle', sentiment: 'positive', platform: 'YouTube' },
        { title: 'Breaking News Update', duration: 300, category: 'News', sentiment: 'negative', platform: 'YouTube' },
        { title: 'Comedy Sketch Show', duration: 240, category: 'Entertainment', sentiment: 'positive', platform: 'YouTube' },
        { title: 'Educational Documentary', duration: 720, category: 'Education', sentiment: 'positive', platform: 'YouTube' },
        { title: 'Workout Tutorial', duration: 900, category: 'Fitness', sentiment: 'positive', platform: 'YouTube' },
        { title: 'Music Video', duration: 180, category: 'Music', sentiment: 'neutral', platform: 'YouTube' },
        { title: 'Tech Review', duration: 420, category: 'Technology', sentiment: 'neutral', platform: 'YouTube' },
        { title: 'Travel Vlog', duration: 540, category: 'Travel', sentiment: 'positive', platform: 'YouTube' },
        { title: 'Gaming Stream', duration: 3600, category: 'Gaming', sentiment: 'neutral', platform: 'Twitch' }
    ];

    console.log('Adding sample video data...');
    
    for (const video of sampleVideos) {
        try {
            const response = await fetch('http://localhost:3000/api/video-history', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(video)
            });
            
            if (response.ok) {
                console.log(`✅ Added: ${video.title}`);
            } else {
                console.log(`❌ Failed: ${video.title}`);
            }
        } catch (error) {
            console.log(`❌ Error adding ${video.title}:`, error);
        }
        
        // Small delay between requests
        await new Promise(resolve => setTimeout(resolve, 100));
    }
    
    console.log('✅ Sample video data added! Refresh the page to see charts.');
}

// Add button to dashboard for easy testing
document.addEventListener('DOMContentLoaded', () => {
    const button = document.createElement('button');
    button.textContent = '📊 Add Sample Videos';
    button.style.cssText = `
        position: fixed;
        top: 100px;
        right: 20px;
        background: #d4a017;
        color: white;
        border: none;
        padding: 10px 20px;
        border-radius: 8px;
        cursor: pointer;
        z-index: 1000;
        font-weight: bold;
    `;
    button.onclick = addSampleVideos;
    document.body.appendChild(button);
});