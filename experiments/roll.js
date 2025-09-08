const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");
let width = (canvas.width = window.innerWidth);
let height = (canvas.height = window.innerHeight);

function resize() {
  width = canvas.width = window.innerWidth;
  height = canvas.height = window.innerHeight;
}
window.addEventListener("resize", resize);

// Die state
let angle = 0;
let rolling = false;
let dieNumber = 1;

// icosahedron approximation with 20 sides (just a polygon for 2D roll)
const sides = 20;
const radius = 60;
const cx = width / 2;
const cy = height / 2;

function drawDie() {
    ctx.clearRect(0, 0, width, height);
  
    // rotate die
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(angle);
  
    // compute vertices for icosahedron-like 20-sided polygon
    const vertices = [];
    for (let i = 0; i < sides; i++) {
      const theta = (i / sides) * 2 * Math.PI;
      const x = radius * Math.cos(theta);
      const y = radius * Math.sin(theta);
      vertices.push({x, y});
    }
  
    // draw main polygon
    ctx.beginPath();
    vertices.forEach((v, i) => {
      if (i === 0) ctx.moveTo(v.x, v.y);
      else ctx.lineTo(v.x, v.y);
    });
    ctx.closePath();
    ctx.fillStyle = "limegreen";
    ctx.fill();
    ctx.strokeStyle = "black";
    ctx.stroke();
  
    // draw “triangular” internal lines
    ctx.strokeStyle = "black";
    for (let i = 0; i < vertices.length; i++) {
      for (let j = i + 2; j < vertices.length; j++) { 
        // connect non-adjacent vertices
        ctx.beginPath();
        ctx.moveTo(vertices[i].x, vertices[i].y);
        ctx.lineTo(vertices[j].x, vertices[j].y);
        ctx.stroke();
      }
    }
  
    // draw number
    ctx.fillStyle = "black";
    ctx.font = "40px monospace";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(dieNumber, 0, 0);
  
    ctx.restore();
  }
  

function animate() {
  if (rolling) angle += 0.3; // speed of roll
  requestAnimationFrame(animate);
  drawDie();
}

animate();

// simulate roll
function rollDie() {
  if (!rolling) {
    rolling = true;
    let steps = 20 + Math.floor(Math.random() * 40); // random spin steps
    let rollInterval = setInterval(() => {
      dieNumber = 1 + Math.floor(Math.random() * 20);
      steps--;
      if (steps <= 0) {
        rolling = false;
        clearInterval(rollInterval);
      }
    }, 50);
  }
}

// mobile shake detection
window.addEventListener("devicemotion", (e) => {
  const acc = e.accelerationIncludingGravity;
  const magnitude = Math.sqrt(acc.x*acc.x + acc.y*acc.y + acc.z*acc.z);
  if (magnitude > 15) rollDie();
});

// click to test on desktop
canvas.addEventListener("click", rollDie);
