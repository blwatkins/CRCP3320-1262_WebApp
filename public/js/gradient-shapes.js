const TOTAL_POLYGONS = 100;

let polygons = [];
let colorPalettes;

function buildPolygons() {
    for (let i = 0; i < TOTAL_POLYGONS; i++) {
        const paletteIndex = Math.floor(random(colorPalettes.length));
        polygons.push(new GradientPolygon(colorPalettes[paletteIndex]));
    }
}

function setup() {
    createCanvas(windowWidth, windowHeight, WEBGL);

    colorPalettes = [
        ['#b879e064', '#9b45d164', '#6a1b9a64', '#4b047764', '#370d5164'],
        ['#342fd464', '#2d59d264', '#2d88cd64', '#2db3c764', '#2ec2a864']
    ];

    buildPolygons();
}

function draw() {
    background(255);

    for (const polygon of polygons) {
        polygon.draw();
    }
}

class GradientPolygon {
    constructor(colors) {
        this.x = random(-(width / 2.0), (width / 2.0));
        this.y = random(-(height / 2.0), (height / 2.0));
        this.radius = random(5, 100);
        this.sides = Math.floor(random(3, 13));
        this.vertices = [];
        this.#buildVertices();

        if (colors) {
            if (Array.isArray(colors)) {
                this.colors = colors.map(element => {
                    if (element instanceof p5.Color) {
                        return element;
                    } else if (typeof element === 'string') {
                        return color(element);
                    } else {
                        return color(0);
                    }
                });
            }
        }
        
        if (!this.colors || this.colors.length === 0) {
            this.colors = [color('#FF000064'), color('#0000FF64')];
        }
    }

    #buildVertices() {
        for (let theta = 0; theta < TWO_PI; theta += (TWO_PI / this.sides)) {
            const vx = cos(theta) * this.radius;
            const vy = sin(theta) * this.radius;
            this.vertices.push(createVector(vx, vy));
        }
    }

    draw() {
        push();
        translate(this.x, this.y);
        stroke(0);
        strokeWeight(2);
        fill(0, 0, 255, 100);
        beginShape();

        this.vertices.forEach((vtx, index) => {
            const colorsIndex = index % this.colors.length;
            const fillColor = this.colors[colorsIndex];
            fill(fillColor);
            vertex(vtx.x, vtx.y);
        });

        endShape(CLOSE);
        pop();
    }
}
