let backgroundColor;
const TOTAL_POLYGONS = 10;
const xs = [];
const ys = [];
const rs = [];
const sides = [];
const colors = [];

function setup() {
    createCanvas(windowWidth, windowHeight);
    backgroundColor = randomColor();
    buildPolygons();
}

function draw() {
    background(backgroundColor);
    drawPolygons();
}

function randomColor() {
    const r = Math.floor(random(0, 255));
    const g = Math.floor(random(0, 255));
    const b = Math.floor(random(0, 255));
    return color(r, g, b);
}

function buildPolygon() {
    const x = random(0, width);
    const y = random(0, height);
    const r = random(10, 100);
    const sideCount = Math.floor(random(3, 10));
    const c = randomColor();

    xs.push(x);
    ys.push(y);
    rs.push(r);
    sides.push(sideCount);
    colors.push(c);
}

function buildPolygons() {
    for (let i = 0; i < TOTAL_POLYGONS; i++) {
        buildPolygon();
    }
}

function drawPolygon(index) {
    push();
    translate(xs[index], ys[index]);
    fill(colors[index]);
    strokeWeight(3);
    stroke(0);
    beginShape();

    for (let theta = 0; theta < TWO_PI; theta += TWO_PI / sides[index]) {
        const x = rs[index] * cos(theta);
        const y = rs[index] * sin(theta);
        vertex(x, y);
    }

    endShape(CLOSE);
    pop();
}

function drawPolygons() {
    for (let i = 0; i < TOTAL_POLYGONS; i++) {
        drawPolygon(i);
    }
}
