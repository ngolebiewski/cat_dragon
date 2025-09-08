import TextWriter from "./bitmapFont.js";
import { playLoop, stopLoop} from "./synth.js";


const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");
ctx.font = "80px monospace";  // CSS monospace / Courier

const button = {
  x: 0,
  y: 0,
  w: 250,
  h: 60,
  text: "PLAY SOUND",
  color: "pink"
};

// state to track if sound is playing
let soundOn = false;


// resize canvas to fill the window
function resize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    // redraw text whenever canvas resizes
    draw();
}
window.addEventListener("resize", resize);
resize();

// draw function
function draw() {
    // fill background
    ctx.fillStyle = "black";
    ctx.fillRect(0, 0, canvas.width, canvas.height);


    ctx.font = "80px monospace";  // CSS monospace / Courier


    ctx.fillStyle = "limegreen";

    const TITLE = new TextWriter(ctx, "Cat Dragon", 8, canvas.width / 2 - 100, canvas.height / 2 - 20);
    TITLE.drawText();

// button
  ctx.fillStyle = button.color;
  ctx.fillRect(button.x, button.y, button.w, button.h);

  ctx.fillStyle = "black";
  ctx.font = "20px monospace";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(soundOn ? "Sound On" : "Sound Off", button.x + button.w / 2, button.y + button.h / 2);
}

// --- HANDLE CLICK ---
canvas.addEventListener("click", (e) => {
  const rect = canvas.getBoundingClientRect();
  const mx = e.clientX - rect.left;
  const my = e.clientY - rect.top;

  if (mx > button.x && mx < button.x + button.w &&
      my > button.y && my < button.y + button.h) {
    
    // toggle sound
    if (!soundOn) {
      playLoop();
      soundOn = true;
    } else {
      stopLoop();
      soundOn = false;
    }
    
    draw(); // update button text
  }
});

draw();
