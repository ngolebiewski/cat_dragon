export default class UIButton {
  constructor(x, y, w, h, text, onClick) {
    this.x = x;
    this.y = y;
    this.w = w;
    this.h = h;
    this.text = text;
    this.onClick = onClick;

    document.addEventListener("click", (e) => {
      const rect = e.target.getBoundingClientRect();
      const scaleX = this.w / rect.width;
      const scaleY = this.h / rect.height;
      const mx = e.clientX - rect.left;
      const my = e.clientY - rect.top;
      if (mx >= this.x && mx <= this.x + this.w &&
          my >= this.y && my <= this.y + this.h) {
        this.onClick();
      }
    });
  }

  draw(ctx) {
    ctx.fillStyle = "#111";
    ctx.fillRect(this.x, this.y, this.w, this.h);
    ctx.strokeStyle = "#fff";
    ctx.strokeRect(this.x, this.y, this.w, this.h);

    ctx.fillStyle = "#fff";
    ctx.font = "10px monospace";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(this.text, this.x + this.w / 2, this.y + this.h / 2);
  }
}
