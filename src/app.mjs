import express from 'express';

import { ColorGenerator } from './color-generator.mjs';
import { MySQLClient } from './mysql-client.mjs';
import { parseRGBComponent } from './utils.mjs';

const app = express();
const port = 3000;

app.use(express.static('public'));
app.set('view engine', 'ejs');
app.set('views', 'views');

const db = MySQLClient;
db.init();

app.get('/', (request, response) => {
    response.render('index', { title: 'CRCP 3320 App' });
});

app.get('/random-color', (request, response) => {
    response.render('random-color', { title: 'Random Color' });
});

app.get('/most-recent-tiles', async (request, response) => {
    try {
        const tiles = await db.queryMostRecentTiles();
        response.render('tiles', { title: "Today's Tiles", hexColors: tiles });
    } catch (error) {
        console.error(error);
        response.status(500).send('Internal Server Error');
    }
});

app.get('/tiles', (request, response) => {
    response.render('tiles', { title: "Today's Tiles", hexColors: ['#FF0000', '#00FF00', '#0000FF', '#FFFF00', '#FF00FF', '#00FFFF', '#000000', '#FFFFFF', '#0000FF', 'cat'] });
});

app.get('/tiles/:date', (request, response) => {
    const dateExpression = /^[0-3][0-9]-[0-3][0-9]-[0-9]{4}$/;
    const requestDate = request.params.date;

    if (dateExpression.test(requestDate)) {
        response.send('Tile Date');
    } else {
        response.status(400).send('Bad Request: Invalid Date');
    }
});

app.get('/api/random-color', async (request, response) => {
    const minR = parseRGBComponent(request.query.minR);
    const maxR = parseRGBComponent(request.query.maxR);
    const minG = parseRGBComponent(request.query.minG);
    const maxG = parseRGBComponent(request.query.maxG);
    const minB = parseRGBComponent(request.query.minB);
    const maxB = parseRGBComponent(request.query.maxB);

    if (minR === null || maxR === null || minG === null || maxG === null || minB === null || maxB === null) {
        response.status(400).json({ error: 'Invalid query parameters. Parameters must be integers between 0 and 255.' });
    } else {
        const colorHex = ColorGenerator.getHexColor({ minR, maxR, minG, maxG, minB, maxB });
        const colorData = await ColorGenerator.getColorData(colorHex);
        response.json(colorData);
    }
});

app.listen(port, () => {
    console.log(`Application listening at port ${port}`);
});
