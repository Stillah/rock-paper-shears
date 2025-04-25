// Model URL from Teachable Machine
const MODEL_URL = "https://teachablemachine.withgoogle.com/models/9WnmePhAo/";

// Global variables
let model, webcam, maxPredictions;
let isRunning = false;

// DOM elements
const startBtn = document.getElementById('start-btn');
const statusElement = document.getElementById('status');
const webcamContainer = document.getElementById('webcam-container');
const labelContainer = document.getElementById('label-container');

// Initialize the application
async function init() {
    try {
        statusElement.textContent = "Status: Loading model...";
        
        // Load the model and metadata
        model = await tmImage.load(MODEL_URL + "model.json", MODEL_URL + "metadata.json");
        maxPredictions = model.getTotalClasses();
        
        // Setup webcam
        const flip = true; // whether to flip the webcam
        webcam = new tmImage.Webcam(400, 400, flip); // width, height, flip
        await webcam.setup(); // request access to the webcam
        await webcam.play();
        
        // Clear the placeholder and append webcam video
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
        
        // Start prediction loop
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
        // Stop webcam
        if (webcam) {
            webcam.stop();
        }
        isRunning = false;
        startBtn.textContent = "Start Webcam";
        statusElement.textContent = "Status: Ready";
    } else {
        // Start webcam
        await init();
    }
}

// Event listeners
startBtn.addEventListener('click', toggleWebcam);

// Clean up on page unload
window.addEventListener('beforeunload', () => {
    if (webcam) {
        webcam.stop();
    }
});