const hexExpression = /^(#[0-9a-f-A-F]{6}|#[0-9a-f-A-F]{8})$/;
let grid;

function setup() {
    const canvasSize = Math.floor(Math.min(window.innerWidth, window.innerHeight) * 0.75);
    const ctx = createCanvas(canvasSize, canvasSize);
    const canvasContainer = document.getElementById('canvas-container');

    if (canvasContainer) {
        canvasContainer.appendChild(ctx.canvas);
    }

    grid = new TilesGrid(tileColors);
}

function draw() {
    grid.draw();
}

class TilesGrid {
    constructor(colorsArray) {
        if (colorsArray && colorsArray.length > 0) {
            this.tileColors = colorsArray.filter(color => hexExpression.test(color));
            this.rows = smallestSquare(this.tileColors.length);
            this.columns = this.rows;
        } else {
            this.tileColors = [];
            this.rows = 1;
            this.columns = 1;
        }
    }

    draw() {
        const tileWidth = width / this.columns;
        const tileHeight = height / this.rows;

        for (let row = 0; row < this.rows; row++) {
            for (let col = 0; col < this.columns; col++) {
                const index = (row * this.columns) + col;

                if (index >= 0 && index < this.tileColors.length) {
                    const x = tileWidth * col;
                    const y = tileHeight * row;
                    strokeWeight(3);
                    stroke(0);
                    fill(this.tileColors[index]);
                    rect(x, y, tileWidth, tileHeight);
                }
            }
        }
    }
}

function smallestSquare(value) {
    if (typeof value === 'number' && value > 0 && value < Number.MAX_SAFE_INTEGER) {
        let result = 1;

        while (result * result < value) {
            result++;
        }

        return result;
    }

    throw new Error('Unsupported value');
}
