const fiveXfiveFont = {
    A: [" 1 ", "1 1", "111", "1 1", "1 1"],
    B: ["11 ", "1 1", "11 ", "1 1", "11 "],
    C: ["111", "1  ", "1  ", "1  ", "111"],
    D: ["11 ", "1 1", "1 1", "1 1", "11 "],
    E: ["111", "1  ", "111", "1  ", "111"],
    F: ["111", "1  ", "111", "1  ", "1  "],
    G: ["111", "1  ", "1 1", "1 1", "111"],
    H: ["1 1", "1 1", "111", "1 1", "1 1"],
    I: ["111", " 1 ", " 1 ", " 1 ", "111"],
    J: [" 11", "  1", "  1", "1 1", "111"],
    K: ["1 1", "1 1", "11 ", "1 1", "1 1"],
    L: ["1  ", "1  ", "1  ", "1  ", "111"],
    M: ["1 1", "111", "111", "1 1", "1 1"],
    N: ["1 1", "111", "111", "111", "1 1"],
    O: ["111", "1 1", "1 1", "1 1", "111"],
    P: ["111", "1 1", "111", "1  ", "1  "],
    Q: ["111", "1 1", "1 1", "111", "  1"],
    R: ["111", "1 1", "111", "11 ", "1 1"],
    S: ["111", "1  ", "111", "  1", "111"],
    T: ["111", " 1 ", " 1 ", " 1 ", " 1 "],
    U: ["1 1", "1 1", "1 1", "1 1", "111"],
    V: ["1 1", "1 1", "1 1", "1 1", " 1 "],
    W: ["1 1", "1 1", "111", "111", "1 1"],
    X: ["1 1", "1 1", " 1 ", "1 1", "1 1"],
    Y: ["1 1", "1 1", " 1 ", " 1 ", " 1 "],
    Z: ["111", "  1", " 1 ", "1  ", "111"],
    "0": ["111", "1 1", "1 1", "1 1", "111"],
    "1": [" 1 ", "11 ", " 1 ", " 1 ", "111"],
    "2": ["111", "  1", "111", "1  ", "111"],
    "3": ["111", "  1", "111", "  1", "111"],
    "4": ["1 1", "1 1", "111", "  1", "  1"],
    "5": ["111", "1  ", "111", "  1", "111"],
    "6": ["111", "1  ", "111", "1 1", "111"],
    "7": ["111", "  1", " 1 ", " 1 ", " 1 "],
    "8": ["111", "1 1", "111", "1 1", "111"],
    "9": ["111", "1 1", "111", "  1", "111"]
};

export default class TextWriter {
    constructor(ctx, message, scale = 4, x = 0, y = 0, color = "limegreen", font = fiveXfiveFont) {
        this.ctx = ctx
        this.message = message;
        this.scale = scale;
        this.x = x;
        this.y = y;
        this.font = font;
        this.color = color
    };

    hello() {
        console.log(this.message)
    }

    drawChar(ctx, ch, x, y, scale = 4) {
        const glyph = this.font[ch.toUpperCase()];
        if (!glyph) return; // skip unknown chars
        glyph.forEach((row, j) => {
            row.split("").forEach((px, i) => {
                if (px === "1") {
                    ctx.fillRect(x + i * scale, y + j * scale, scale, scale);
                }
            });
        });
    }

    drawText(ctx=this.ctx, message=this.message, x=this.x, y=this.y, scale = this.scale, spacing = 1) {
        [...message].forEach((ch, i) => {
            this.drawChar(ctx, ch, x + i * (scale * (3 + spacing)), y, scale);
        });
    }
}


// test stuff for node
const hi = new TextWriter("Hello World")
hi.hello()
