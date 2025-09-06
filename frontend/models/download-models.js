// Download face-api.js models
const models = [
    'tiny_face_detector_model-weights_manifest.json',
    'tiny_face_detector_model-shard1',
    'age_gender_model-weights_manifest.json',
    'age_gender_model-shard1'
];

async function downloadModels() {
    const baseUrl = 'https://raw.githubusercontent.com/justadudewhohacks/face-api.js/master/weights/';
    
    for (const model of models) {
        try {
            const response = await fetch(baseUrl + model);
            const blob = await response.blob();
            
            // Create download link
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = model;
            a.click();
            window.URL.revokeObjectURL(url);
            
            console.log(`Downloaded: ${model}`);
        } catch (error) {
            console.error(`Failed to download ${model}:`, error);
        }
    }
}

// Auto-download on page load
downloadModels();