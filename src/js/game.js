import TextWriter from "./bitmapFont.js";
import { playLoop, stopLoop } from "./synth.js";

// --- CANVAS SETUP ---
const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");
ctx.font = "80px monospace";
ctx.imageSmoothingEnabled = false; // pixel-perfect scaling

function resize() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}
window.addEventListener("resize", resize);
resize();

// --- BUTTON ---
const button = {
  x: 0,
  y: 0,
  w: 250,
  h: 60,
  text: "PLAY SOUND",
  color: "pink"
};
let soundOn = false;

// --- CAT SPRITESHEET ---
const catImg = new Image();
catImg.src = "images/cat1x2.png"; // relative to index.html

const cat = {
  x: canvas.width / 2,
  y: canvas.height / 2 + 100,
  w: 8,
  h: 8,
  scale: 4,
  frame: 0,
  frameCount: 2
};

// --- ANIMATION CONTROL ---
let frameCounter = 0;
const FRAME_DELAY = 10; // slower sprite animation

// --- KEYBOARD MOVEMENT ---
const keys = {};
window.addEventListener("keydown", (e) => { keys[e.key] = true; });
window.addEventListener("keyup", (e) => { keys[e.key] = false; });

function updateCat() {
  if (keys["ArrowLeft"])  cat.x -= 4;
  if (keys["ArrowRight"]) cat.x += 4;
  if (keys["ArrowUp"])    cat.y -= 4;
  if (keys["ArrowDown"])  cat.y += 4;

  frameCounter++;
  if (frameCounter >= FRAME_DELAY) {
    cat.frame = (cat.frame + 1) % cat.frameCount;
    frameCounter = 0;
  }
}

// --- DRAW ---
function draw() {
  // background
  ctx.fillStyle = "grey";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // title
  ctx.font = "80px monospace";
  ctx.fillStyle = "limegreen";
  new TextWriter(ctx, "Cat Dragon", 8, canvas.width / 2 - 100, canvas.height / 2 - 20).drawText();

  // button
  ctx.fillStyle = button.color;
  ctx.fillRect(button.x, button.y, button.w, button.h);
  ctx.fillStyle = "black";
  ctx.font = "20px monospace";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(soundOn ? "Sound On" : "Sound Off", button.x + button.w / 2, button.y + button.h / 2);

  // draw cat if loaded
  if (catImg.complete) {
    ctx.drawImage(
      catImg,
      cat.frame * cat.w, 0, cat.w, cat.h,         // source
      cat.x, cat.y, cat.w * cat.scale, cat.h * cat.scale // destination
    );
  }
}

// --- CLICK BUTTON ---
canvas.addEventListener("click", (e) => {
  const rect = canvas.getBoundingClientRect();
  const mx = e.clientX - rect.left;
  const my = e.clientY - rect.top;

  if (mx > button.x && mx < button.x + button.w &&
      my > button.y && my < button.y + button.h) {

    if (!soundOn) {
      playLoop();
      soundOn = true;
    } else {
      stopLoop();
      soundOn = false;
    }

    draw();
  }
});

// --- MAIN LOOP (60fps) ---
function loop() {
  updateCat();
  draw();
  requestAnimationFrame(loop);
}

// start immediately
loop();
