// make a die to roll!

export class DieRoller {
    constructor(color = null, sprite = d20Img, x = 50, y = 50, scale = 1) {
        this.color = color;
        this.sprite = sprite;
        this.x = x;
        this.y = y;
        this.w = 32;
        this.h = 32;
        this.scale = scale;
        this.vx = 0;
        this.vy = 0;
        this.result = Math.floor(Math.random() * 20) + 1;
        this.nextUpdate = 0;
        this.settling = false;
        this.settleTimer = 0;
    }


}


export default class D20 {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.velocity = 0;
    this.number = 1;
  }

  roll() {
    this.velocity = 5; // start shake
  }

  update() {
    if (this.velocity > 0) {
      this.number = Math.floor(Math.random() * 20) + 1;
      this.velocity *= 0.9; // friction
      if (this.velocity < 0.1) this.velocity = 0;
    }
  }

  draw(ctx) {
    // Simple gray square as die body
    ctx.fillStyle = "#888";
    ctx.fillRect(this.x, this.y, 20, 20);

    // Number on top
    ctx.fillStyle = "white";
    ctx.font = "12px monospace";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(this.number, this.x + 10, this.y + 10);
  }
}
