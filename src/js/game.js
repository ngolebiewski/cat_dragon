import TextWriter from "./bitmapFont.js";

const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");
ctx.font = "80px monospace";  // CSS monospace / Courier


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

    // draw text
    // ctx.fillStyle = "limegreen";
    ctx.font = "80px monospace";  // CSS monospace / Courier
    // ctx.textAlign = "center";
    // ctx.textBaseline = "middle";
    // //   ctx.fillText("CAT DRAGON", canvas.width / 2, canvas.height / 2);
    // TITLE = new TextWriter(ctx, "Cat Dragon")
    // console.log(TITLE)
    // TITLE.drawText()

    ctx.fillStyle = "limegreen";

    const TITLE = new TextWriter(ctx, "Cat Dragon", 8, canvas.width / 2 - 100, canvas.height / 2 - 20);
    TITLE.drawText(TITLE.message, TITLE.x, TITLE.y, TITLE.scale);

}
