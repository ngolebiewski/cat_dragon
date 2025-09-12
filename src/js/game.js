import TextWriter from "./bitmapFont.js";
import { playLoop, stopLoop } from "./synth.js";

///////////////////////////////////
//  --- NES BASE RESOLUTION ---
///////////////////////////////////
const BASE_WIDTH = 256;
const BASE_HEIGHT = 224;

///////////////////////////////////
// --- CANVAS SETUP ---
///////////////////////////////////
const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d", { alpha: false });
ctx.imageSmoothingEnabled = false;
canvas.style.imageRendering = "pixelated";

///////////////////////////////////
// offscreen buffer for NES world
///////////////////////////////////
const buffer = document.createElement("canvas");
buffer.width = BASE_WIDTH;
buffer.height = BASE_HEIGHT;
const bctx = buffer.getContext("2d");
bctx.imageSmoothingEnabled = false;

///////////////////////////////////
// --- SCALING + CENTERING ---
///////////////////////////////////
let scale = 1;
let offsetX = 0;
let offsetY = 0;

function resize() {
  const dpr = window.devicePixelRatio || 1;

  // Viewport in CSS pixels
  const vw = window.innerWidth;
  const vh = window.innerHeight;

  // Compute scale to fit entire viewport
  const scaleX = vw / BASE_WIDTH;
  const scaleY = vh / BASE_HEIGHT;
  scale = Math.min(scaleX, scaleY); // scale dynamically to fit viewport

  // Compute final display size
  const displayW = BASE_WIDTH * scale;
  const displayH = BASE_HEIGHT * scale;

  // Center offsets
  offsetX = (vw - displayW) / 2;
  offsetY = (vh - displayH) / 2;

  // Canvas backing store matches device pixels
  canvas.width = vw * dpr;
  canvas.height = vh * dpr;

  // Canvas CSS size matches viewport
  canvas.style.width = `${vw}px`;
  canvas.style.height = `${vh}px`;

  // Reset transform and scale for DPR
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.scale(dpr, dpr);
  ctx.imageSmoothingEnabled = false;
}


window.addEventListener("resize", resize);
resize();

///////////////////////////////////
// --- BUTTONS ---
///////////////////////////////////
const soundButton = { x: 0, y: 0, w: 80, h: 20, color: "pink", active: false };
const motionButton = { x: 100, y: 0, w: 120, h: 20, color: "orange", active: true };

///////////////////////////////////
// --- CAT SPRITE ---
///////////////////////////////////
const catImg = new Image();
catImg.src = "images/cat1x2.png";

const cat = {
  x: BASE_WIDTH / 2,
  y: BASE_HEIGHT / 2 + 40,
  w: 8,
  h: 8,
  scale: 4,
  frame: 0,
  frameCount: 2,
  direction: "right"
};

///////////////////////////////////
// --- D20 SPRITE ---
///////////////////////////////////
const d20Img = new Image();
d20Img.src = "images/d20.gif";

const d20 = {
  x: BASE_WIDTH / 2,
  y: BASE_HEIGHT / 2,
  w: 32,
  h: 32,
  scale: 1,
  vx: 0,
  vy: 0,
  result: Math.floor(Math.random() * 20) + 1,
  nextUpdate: 0,
  settling: false,
  settleTimer: 0
};

///////////////////////////////////
// --- ANIMATION CONTROL ---
///////////////////////////////////
let frameCounter = 0;
const FRAME_DELAY = 10;

///////////////////////////////////
// --- KEYBOARD MOVEMENT ---
///////////////////////////////////
const keys = {};
window.addEventListener("keydown", (e) => { keys[e.key] = true; });
window.addEventListener("keyup", (e) => { keys[e.key] = false; });

///////////////////////////////////
// --- TOUCH / TAP HANDLING ---
///////////////////////////////////
const touches = { left: false, right: false, up: false, down: false };
let touchStartX = 0;
let touchStartY = 0;

canvas.addEventListener("touchstart", (e) => {
  e.preventDefault();
  if (e.touches.length === 1) {
    touchStartX = e.touches[0].clientX;
    touchStartY = e.touches[0].clientY;
  }
});

canvas.addEventListener("touchmove", handleTouch, { passive: false });

canvas.addEventListener("touchend", (e) => {
  if (e.changedTouches.length === 1) {
    const dx = Math.abs(e.changedTouches[0].clientX - touchStartX);
    const dy = Math.abs(e.changedTouches[0].clientY - touchStartY);

    if (dx < 10 && dy < 10) {
      // treat small movement as a tap
      handleCanvasTap(e.changedTouches[0].clientX, e.changedTouches[0].clientY);
    }
  }
  touches.left = touches.right = touches.up = touches.down = false;
});

function handleTouch(e) {
  const rect = canvas.getBoundingClientRect();
  touches.left = touches.right = touches.up = touches.down = false;

  for (let i = 0; i < e.touches.length; i++) {
    const tx = (e.touches[i].clientX - rect.left - offsetX) / scale;
    const ty = (e.touches[i].clientY - rect.top - offsetY) / scale;

    // only move cat if drag > 10px
    if (Math.abs(tx - BASE_WIDTH/2) > 10) {
      if (tx < BASE_WIDTH / 2) touches.left = true;
      else touches.right = true;
    }
    if (Math.abs(ty - BASE_HEIGHT/2) > 10) {
      if (ty < BASE_HEIGHT / 2) touches.up = true;
      else touches.down = true;
    }
  }
}

///////////////////////////////////
// --- CLICK HANDLER (desktop)
///////////////////////////////////
canvas.addEventListener("click", (e) => {
  handleCanvasTap(e.clientX, e.clientY);
});

function handleCanvasTap(clientX, clientY) {
  const mx = (clientX - canvas.getBoundingClientRect().left - offsetX) / scale;
  const my = (clientY - canvas.getBoundingClientRect().top - offsetY) / scale;

  // Motion button
  if (motionButton.active &&
      mx > motionButton.x && mx < motionButton.x + motionButton.w &&
      my > motionButton.y && my < motionButton.y + motionButton.h) {
    motionButton.active = false;
    requestMotionPermission();
    return true;
  }

  // Sound button
  if (mx > soundButton.x && mx < soundButton.x + soundButton.w &&
      my > soundButton.y && my < soundButton.y + soundButton.h) {
    soundButton.active = !soundButton.active;
    if (soundButton.active) playLoop();
    else stopLoop();
    return true;
  }

  // D20 click
  if (mx > d20.x && mx < d20.x + d20.w * d20.scale &&
      my > d20.y && my < d20.y + d20.h * d20.scale) {

    shaking = true;
    lastShakeTime = Date.now();
    d20.vx = (Math.random() - 0.5) * 80;
    d20.vy = (Math.random() - 0.5) * 80;

    setTimeout(() => {
      shaking = false;
      onShakeRelease();
    }, 1000); // 1 second shake

    return true;
  }

  return false;
}


///////////////////////////////////
// --- UPDATE CAT ---
///////////////////////////////////
function updateCat() {
  if (keys["ArrowLeft"] || touches.left) { cat.x -= 2; cat.direction = "left"; }
  if (keys["ArrowRight"] || touches.right) { cat.x += 2; cat.direction = "right"; }
  if (keys["ArrowUp"] || touches.up) cat.y -= 2;
  if (keys["ArrowDown"] || touches.down) cat.y += 2;

  cat.x = Math.max(0, Math.min(BASE_WIDTH - cat.w * cat.scale, cat.x));
  cat.y = Math.max(0, Math.min(BASE_HEIGHT - cat.h * cat.scale, cat.y));

  frameCounter++;
  if (frameCounter >= FRAME_DELAY) {
    cat.frame = (cat.frame + 1) % cat.frameCount;
    frameCounter = 0;
  }
}

///////////////////////////////////
// --- D20 ROLLING / SHAKE ---
///////////////////////////////////
let shaking = false;
let lastShakeTime = 0;

async function requestMotionPermission() {
  if (typeof DeviceMotionEvent.requestPermission === "function") {
    const response = await DeviceMotionEvent.requestPermission();
    if (response === "granted") startMotionTracking();
  } else startMotionTracking();
}

function startMotionTracking() {
  window.addEventListener("devicemotion", (event) => {
    const acc = event.accelerationIncludingGravity;
    if (!acc) return;

    const x = acc.x || 0;
    const y = acc.y || 0;
    const z = acc.z || 0;

    const magnitude = Math.sqrt(x*x + y*y + z*z);
    const now = Date.now();

    if (magnitude > 20) { 
      if (!shaking) shaking = true;
      lastShakeTime = now;

      d20.vx += (Math.random() - 0.5) * 50;
      d20.vy += (Math.random() - 0.5) * 50;
    } else if (shaking && now - lastShakeTime > 300) {
      shaking = false;
      onShakeRelease();
    }
  });
}

function onShakeRelease() {
  d20.settling = true;
  d20.settleTimer = 2 * 60; // 2 beats
}

function updateD20() {
  d20.x += d20.vx;
  d20.y += d20.vy;

  d20.vx *= 0.95;
  d20.vy *= 0.95;

  if (d20.x < 0) { d20.x = 0; d20.vx *= -0.8; }
  if (d20.x > BASE_WIDTH - d20.w) { d20.x = BASE_WIDTH - d20.w; d20.vx *= -0.8; }
  if (d20.y < 0) { d20.y = 0; d20.vy *= -0.8; }
  if (d20.y > BASE_HEIGHT - d20.h) { d20.y = BASE_HEIGHT - d20.h; d20.vy *= -0.8; }

  const speed = Math.abs(d20.vx) + Math.abs(d20.vy);

  if (d20.settling) {
    d20.settleTimer--;
    if (d20.settleTimer <= 0) {
      d20.vx = 0;
      d20.vy = 0;
      d20.settling = false;
      console.log("Final roll:", d20.result);
    } else {
      d20.vx += (Math.random() - 0.5) * 0.2;
      d20.vy += (Math.random() - 0.5) * 0.2;
    }
  }

  if (!d20.settling || d20.settleTimer > 0) {
    const cycleSpeed = Math.abs(d20.vx) + Math.abs(d20.vy);
    if (cycleSpeed > 0.1 && Date.now() > d20.nextUpdate) {
      d20.result = Math.floor(Math.random() * 20) + 1;
      d20.nextUpdate = Date.now() + Math.max(50, 500 - cycleSpeed * 20);
    }
  }
}

///////////////////////////////////
// --- DRAW BUFFER ---
///////////////////////////////////
function drawBuffer() {
  bctx.fillStyle = "#333";
  bctx.fillRect(0, 0, BASE_WIDTH, BASE_HEIGHT);

  bctx.fillStyle = "limegreen";
  new TextWriter(bctx, "Cat Dragon", 6, 10, BASE_HEIGHT / 2 - 20).drawText();

  // Sound Button
  bctx.fillStyle = soundButton.color;
  bctx.fillRect(soundButton.x, soundButton.y, soundButton.w, soundButton.h);
  bctx.fillStyle = "black";
  bctx.font = "10px monospace";
  bctx.textAlign = "center";
  bctx.textBaseline = "middle";
  bctx.fillText(soundButton.active ? "Sound On" : "Sound Off", soundButton.x + soundButton.w/2, soundButton.y + soundButton.h/2);

  // Motion Button
  if (motionButton.active) {
    bctx.fillStyle = motionButton.color;
    bctx.fillRect(motionButton.x, motionButton.y, motionButton.w, motionButton.h);
    bctx.fillStyle = "black";
    bctx.fillText("Enable Motion", motionButton.x + motionButton.w/2, motionButton.y + motionButton.h/2);
  }

  // D20
  bctx.drawImage(d20Img, 0, 0, d20.w, d20.h, d20.x, d20.y, d20.w*d20.scale, d20.h*d20.scale);
  bctx.fillStyle = "black";
  bctx.textAlign = "center";
  bctx.textBaseline = "middle";
  bctx.font = "10px monospace";
  bctx.fillText(d20.result, d20.x + (d20.w*d20.scale)/2, d20.y + (d20.h*d20.scale)/2);

  // Cat
  if (catImg.complete) {
    bctx.save();
    if (cat.direction === "left") {
      bctx.translate(cat.x + cat.w * cat.scale, cat.y);
      bctx.scale(-1, 1);
      bctx.drawImage(catImg, cat.frame * cat.w, 0, cat.w, cat.h, 0, 0, cat.w * cat.scale, cat.h * cat.scale);
    } else {
      bctx.drawImage(catImg, cat.frame * cat.w, 0, cat.w, cat.h, cat.x, cat.y, cat.w * cat.scale, cat.h * cat.scale);
    }
    bctx.restore();
  }
}

///////////////////////////////////
// --- RENDER BUFFER ---
///////////////////////////////////
function render() {
  ctx.fillStyle = "black";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.drawImage(buffer, 0, 0, BASE_WIDTH, BASE_HEIGHT, offsetX, offsetY, BASE_WIDTH * scale, BASE_HEIGHT * scale);
}

///////////////////////////////////
// --- MAIN LOOP ---
///////////////////////////////////
let lastTime = 0;
const FRAME_DURATION = 1000 / 60;

function loop(timestamp) {
  if (timestamp - lastTime >= FRAME_DURATION) {
    lastTime = timestamp;
    updateCat();
    updateD20();
    drawBuffer();
    render();
  }
  requestAnimationFrame(loop);
}

requestAnimationFrame(loop);
