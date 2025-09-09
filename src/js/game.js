import TextWriter from "./bitmapFont.js";
import { playLoop, stopLoop } from "./synth.js";

// --- NES BASE RESOLUTION ---
const BASE_WIDTH = 256;
const BASE_HEIGHT = 224;

// --- CANVAS SETUP ---
const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d", { alpha: false });
ctx.imageSmoothingEnabled = false;
canvas.style.imageRendering = "pixelated";

// offscreen buffer for NES world
const buffer = document.createElement("canvas");
buffer.width = BASE_WIDTH;
buffer.height = BASE_HEIGHT;
const bctx = buffer.getContext("2d");
bctx.imageSmoothingEnabled = false;

// --- SCALING + CENTERING ---
let scale = 1;
let offsetX = 0;
let offsetY = 0;

function resize() {
  const dpr = window.devicePixelRatio || 1;

  // full window in device pixels
  canvas.width = window.innerWidth * dpr;
  canvas.height = window.innerHeight * dpr;
  canvas.style.width = `${window.innerWidth}px`;
  canvas.style.height = `${window.innerHeight}px`;

  // integer scaling
  let scaleX = Math.floor(canvas.width / (BASE_WIDTH * dpr));
  let scaleY = Math.floor(canvas.height / (BASE_HEIGHT * dpr));
  scale = Math.max(1, Math.min(scaleX, scaleY));

  // if scale too small on mobile, allow fractional scale
  if (scale < 2) {
    scale = Math.min(
      canvas.width / (BASE_WIDTH * dpr),
      canvas.height / (BASE_HEIGHT * dpr)
    );
  }

  const displayW = BASE_WIDTH * scale;
  const displayH = BASE_HEIGHT * scale;
  offsetX = (window.innerWidth - displayW) / 2;
  offsetY = (window.innerHeight - displayH) / 2;

  // adjust for DPR
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.scale(dpr, dpr);
  ctx.imageSmoothingEnabled = false;
}

window.addEventListener("resize", resize);
resize();

// --- BUTTON ---
const button = { x: 0, y: 0, w: 80, h: 20, color: "pink" };
let soundOn = false;

// --- CAT SPRITE ---
const catImg = new Image();
catImg.src = "images/cat1x2.png"; // adjust path

const cat = {
  x: BASE_WIDTH / 2,
  y: BASE_HEIGHT / 2 + 40,
  w: 8,
  h: 8,
  scale: 4,
  frame: 0,
  frameCount: 2,
  direction: "right" // "left" or "right"
};

// --- ANIMATION CONTROL ---
let frameCounter = 0;
const FRAME_DELAY = 10;

// --- KEYBOARD MOVEMENT ---
const keys = {};
window.addEventListener("keydown", (e) => { keys[e.key] = true; });
window.addEventListener("keyup", (e) => { keys[e.key] = false; });

// --- UPDATE CAT POSITION & ANIMATION ---
function updateCat() {
  if (keys["ArrowLeft"]) {
    cat.x -= 2;
    cat.direction = "left";
  }
  if (keys["ArrowRight"]) {
    cat.x += 2;
    cat.direction = "right";
  }
  if (keys["ArrowUp"])    cat.y -= 2;
  if (keys["ArrowDown"])  cat.y += 2;

  // clamp to NES screen
  cat.x = Math.max(0, Math.min(BASE_WIDTH - cat.w * cat.scale, cat.x));
  cat.y = Math.max(0, Math.min(BASE_HEIGHT - cat.h * cat.scale, cat.y));

  // animate sprite
  frameCounter++;
  if (frameCounter >= FRAME_DELAY) {
    cat.frame = (cat.frame + 1) % cat.frameCount;
    frameCounter = 0;
  }
}

// --- DRAW GAME WORLD TO BUFFER ---
function drawBuffer() {
  // background
  bctx.fillStyle = "grey";
  bctx.fillRect(0, 0, BASE_WIDTH, BASE_HEIGHT);

  // title
  bctx.fillStyle = "limegreen";
  new TextWriter(bctx, "Cat Dragon", 6, 10, BASE_HEIGHT / 2 - 20).drawText();

  // button
  bctx.fillStyle = button.color;
  bctx.fillRect(button.x, button.y, button.w, button.h);
  bctx.fillStyle = "black";
  bctx.font = "8px monospace";
  bctx.textAlign = "center";
  bctx.textBaseline = "middle";
  bctx.fillText(soundOn ? "Sound On" : "Sound Off", button.x + button.w / 2, button.y + button.h / 2);

  // cat sprite
  if (catImg.complete) {
    bctx.save();
    if (cat.direction === "left") {
      // flip horizontally
      bctx.translate(cat.x + cat.w * cat.scale, cat.y);
      bctx.scale(-1, 1);
      bctx.drawImage(
        catImg,
        cat.frame * cat.w, 0, cat.w, cat.h,
        0, 0, cat.w * cat.scale, cat.h * cat.scale
      );
    } else {
      bctx.drawImage(
        catImg,
        cat.frame * cat.w, 0, cat.w, cat.h,
        cat.x, cat.y, cat.w * cat.scale, cat.h * cat.scale
      );
    }
    bctx.restore();
  }
}

// --- RENDER BUFFER TO SCREEN ---
function render() {
  ctx.fillStyle = "black";
  ctx.fillRect(0, 0, canvas.width, canvas.height); // black borders

  ctx.drawImage(
    buffer,
    0, 0, BASE_WIDTH, BASE_HEIGHT,           // source
    offsetX, offsetY, BASE_WIDTH * scale, BASE_HEIGHT * scale // scaled destination
  );
}

// --- CLICK BUTTON ---
canvas.addEventListener("click", (e) => {
  const rect = canvas.getBoundingClientRect();
  const mx = (e.clientX - rect.left - offsetX) / scale;
  const my = (e.clientY - rect.top - offsetY) / scale;

  if (mx > button.x && mx < button.x + button.w &&
      my > button.y && my < button.y + button.h) {

    if (!soundOn) {
      playLoop();
      soundOn = true;
    } else {
      stopLoop();
      soundOn = false;
    }
  }
  setTimeout(100)
});

// --- MAIN LOOP (60 FPS) ---
let lastTime = 0;
const FRAME_DURATION = 1000 / 60;

function loop(timestamp) {
  if (timestamp - lastTime >= FRAME_DURATION) {
    lastTime = timestamp;
    updateCat();
    drawBuffer();
    render();
  }
  requestAnimationFrame(loop);
}

requestAnimationFrame(loop);
