const MODEL_URL = "https://teachablemachine.withgoogle.com/models/9WnmePhAo/";
let model, webcam, maxPredictions;
let isRunning = false;

const startBtn = document.getElementById('start-btn');
const statusElement = document.getElementById('status');
const webcamContainer = document.getElementById('webcam-container');
const labelContainer = document.getElementById('label-container');


async function init() {
    try {
        statusElement.textContent = "Status: Loading model...";
        
        model = await tmImage.load(MODEL_URL + "model.json", MODEL_URL + "metadata.json");
        maxPredictions = model.getTotalClasses();
        
        const flip = true; // whether to flip the webcam
        webcam = new tmImage.Webcam(400, 400, flip); 
        await webcam.setup(); // request access to the webcam
        await webcam.play();
        
        webcamContainer.innerHTML = '';
        webcamContainer.appendChild(webcam.canvas);
        
        // Create prediction elements
        labelContainer.innerHTML = '';
        classes = ['Rock', 'Paper', 'Scissors']
        for (let i = 0; i < maxPredictions; i++) {
            const predictionElement = document.createElement('div');
            predictionElement.className = 'prediction-item';
            predictionElement.innerHTML = `
                <span class="prediction-label">${classes[i]}</span>
                <span class="prediction-value" id="prediction-${i}">0%</span>
            `;
            labelContainer.appendChild(predictionElement);
        }
        
        statusElement.textContent = "Status: Model loaded, predicting...";
        isRunning = true;
        startBtn.textContent = "Stop Webcam";
        
        window.requestAnimationFrame(loop);
    } catch (error) {
        console.error("Error initializing:", error);
        statusElement.textContent = "Status: Error - " + error.message;
    }
}

// Main prediction loop
async function loop() {
    if (isRunning) {
        webcam.update(); // update the webcam frame
        await predict();
        window.requestAnimationFrame(loop);
    }
}

// Run prediction on current webcam frame
async function predict() {
    if (!isRunning) return;
    
    const prediction = await model.predict(webcam.canvas);
    for (let i = 0; i < maxPredictions; i++) {
        const percentage = (prediction[i].probability * 100).toFixed(1);
        document.getElementById(`prediction-${i}`).textContent = `${percentage}%`;
    }
}

// Toggle webcam on/off
async function toggleWebcam() {
    if (isRunning) {
        if (webcam) {
            webcam.stop();
        }
        isRunning = false;
        startBtn.textContent = "Start Webcam";
        statusElement.textContent = "Status: Ready";
    } else {
        await init();
    }
}

startBtn.addEventListener('click', toggleWebcam);
window.addEventListener('beforeunload', () => {
    if (webcam) {
        webcam.stop();
    }
});
