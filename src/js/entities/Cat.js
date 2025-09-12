export default class Cat {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.color = "orange";
  }

  update() {
    // For now, idle cat. Later: input-based movement
  }

  draw(ctx) {
    ctx.fillStyle = this.color;
    ctx.fillRect(this.x, this.y, 16, 16);
  }
}
