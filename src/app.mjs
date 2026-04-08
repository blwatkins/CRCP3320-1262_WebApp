import express from 'express';

import { ColorGenerator } from './color-generator.mjs';
import { DateUtility } from './date-utility.js';
import { MySQLClient } from './mysql-client.mjs';
import { SequelizeClient } from './sequelize-client.mjs';
import { StringUtility } from './string-utility.mjs';
import { parseRGBComponent, parseInteger } from './utils.mjs';

const app = express();
const port = 3000;

app.use(express.static('public'));
app.use(express.json());
app.set('view engine', 'ejs');
app.set('views', 'views');

const dbClientType = 'mysql'; // process.env.DATABASE_TYPE;
let dbClient;

if (dbClientType === 'mysql') {
    dbClient = MySQLClient;
} else {
    dbClient = SequelizeClient;
}

const db = dbClient;
await db.init();

app.get('/', (request, response) => {
    response.render('index', { title: 'CRCP 3320 App' });
});

app.get('/random-color', (request, response) => {
    response.render('random-color', { title: 'Random Color' });
});

app.get('/new-tile', (request, response) => {
    response.render('tile-form', { title: 'New Tile' });
});

app.get('/most-recent-tiles', async (request, response) => {
    const limit = parseInteger(request.query.limit) ?? 100;

    try {
        const tiles = await db.queryMostRecentTiles(limit);
        response.render('tiles', { title: 'Most Recent Tiles', hexColors: tiles });
    } catch (error) {
        console.error(error);
        response.status(500).send('Internal Server Error');
    }
});

app.get('/tiles', async (request, response) => {
    try {
        const tiles = await db.queryTilesByDate(DateUtility.getCurrentDate());
        response.render('tiles', { title: "Today's Tiles", hexColors: tiles });
    } catch (error) {
        console.error(error);
        response.status(500).send('Internal Server Error');
    }
});

app.get('/tiles/:date', async (request, response) => {
    const requestDate = request.params.date;

    if (!DateUtility.isValidDate(requestDate)) {
        response.status(400).send('Bad Request: Invalid date. Accepted date format: YYYY-MM-DD.');
    }

    try {
        const tiles = await db.queryTilesByDate(requestDate);
        response.render('tiles', { title: 'Tiles by Day', hexColors: tiles });
    } catch (error) {
        console.error(error);
        response.status(500).send('Internal Server Error');
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
        try {
            const colorHex = ColorGenerator.getHexColor({ minR, maxR, minG, maxG, minB, maxB });
            const colorData = await ColorGenerator.getColorData(colorHex);

            if (colorData) {
                response.json(colorData);
            } else {
                response.status(400).json({ error: 'Bad Request.' });
            }
        } catch (error) {
            response.status(500).json({ error: 'Internal Server Error.' });
        }
    }
});

app.post('/api/tile', async (request, response) => {
    const requestColorHex = request.body.colorHex;

    if (!StringUtility.isHexColor(requestColorHex)) {
        return response.status(400).send('Bad Request: Invalid colorHex string.');
    }

    try {
        const result = await db.insertTile(requestColorHex);

        if (result.status === 200) {
            return response.json({ message: result.message });
        } else if (result.status === 400 || result.status === 500) {
            return response.status(result.status).json({ error: result.message });
        }
    } catch (error) {
        console.error(error);
        return response.status(500).send({ error: 'Internal Server Error.' });
    }
});

app.listen(port, () => {
    console.log(`Application listening at port ${port}`);
});
