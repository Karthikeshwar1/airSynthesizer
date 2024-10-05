import Particles from "./Particles.js";
import Sound from "./Sound.js";

// Mediapipe setup
const videoElement = document.createElement('video');
const canvasElement = document.createElement('canvas');
const canvasCtx = canvasElement.getContext('2d');

// Set up video and canvas
videoElement.width = 640;
videoElement.height = 480;
canvasElement.width = 640;
canvasElement.height = 480;
document.body.appendChild(videoElement);
document.body.appendChild(canvasElement);

// Mediapipe hand tracking
const hands = new Hands({
  locateFile: (file) => {
    return `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`;
  }
});
hands.setOptions({
  maxNumHands: 2,
  modelComplexity: 1,
  minDetectionConfidence: 0.5,
  minTrackingConfidence: 0.5
});

let handX = 0;
let handY = 0;

hands.onResults((results) => {
  
  canvasCtx.clearRect(0, 0, canvasElement.width, canvasElement.height);
  canvasCtx.drawImage(results.image, 0, 0, canvasElement.width, canvasElement.height);
  
  if (results.multiHandLandmarks) {
    for (const landmarks of results.multiHandLandmarks) {
      drawConnectors(canvasCtx, landmarks, HAND_CONNECTIONS, {color: '#00FF00', lineWidth: 5});
      drawLandmarks(canvasCtx, landmarks, {color: '#FF0000', lineWidth: 2});
      
      // Get hand coordinates
      handX = landmarks[0].x;
      handY = landmarks[0].y;
    }
  }
});

// Set up camera
const camera = new Camera(videoElement, {
  onFrame: async () => {
    await hands.send({image: videoElement});
  },
  width: 640,
  height: 480
});
camera.start();

// Particles and sound setup
const canvas = document.querySelector("canvas");
const particles = new Particles(canvas);
let i = 0;
let sound;

document.body.addEventListener("click", onCanvasTap);

function onCanvasTap(event) {
  if (!sound) {
    document.querySelector("h1").remove();
    document.body.style.cursor = "crosshair";
    sound = new Sound();
    tick();
  }
}

function tick() {
  requestAnimationFrame(tick);
  sound.tick(1-handX, handY); // Use hand coordinates
  particles.drawParticles(
    (1-handX) * canvas.width, 
    handY * canvas.height, 
    (1 - handY) * 7.75 + 0.25
  );
  i++;
}

