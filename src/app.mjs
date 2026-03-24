import express from 'express';

import { ColorGenerator } from './color-generator.mjs';

const app = express();
const port = 3000;

app.use(express.static('public'));
app.set('view engine', 'ejs');
app.set('views', 'views');

app.get('/', (request, response) => {
    response.render('index', { title: "CRCP 3320 App" });
});

app.get('/random-color', (request, response) => {
    response.render('random-color', { title: "Random Color" });
});

function processNumberParam(input) {
    if (typeof input === 'number' && !isNaN(input) && input >= 0 && input <= 255) {
        return Math.floor(input);
    }

    if (input === undefined) {
        return undefined;
    }

    const parsed = parseInt(input, 10);

    if (!isNaN(parsed) && parsed >= 0 && parsed <= 255) {
        return Math.floor(parsed);
    }

    return null;
}

app.get('/api/random-color', async (request, response) => {
    const minR = processNumberParam(request.query.minR);
    const maxR = processNumberParam(request.query.maxR);
    const minG = processNumberParam(request.query.minG);
    const maxG = processNumberParam(request.query.maxG);
    const minB = processNumberParam(request.query.minB);
    const maxB = processNumberParam(request.query.maxB);

    if (minR === null || maxR === null || minG === null || maxG === null || minB === null || maxB === null) {
       response.status(400).json({ error: "Invalid query parameters. Parameters must be integers between 0 and 255." });
    } else {
        const colorHex = ColorGenerator.getHexColor({ minR, maxR, minG, maxG, minB, maxB });
        const colorData = await ColorGenerator.getColorData(colorHex);
        response.json(colorData);
    }
});

app.listen(port, () => {
    console.log(`Application listening at port ${port}`);
});
