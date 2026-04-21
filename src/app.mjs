import express from 'express';
import helmet from 'helmet';
import cors from 'cors';

import { rateLimit } from 'express-rate-limit';

import { ColorGenerator } from './color-generator.mjs';
import { DateUtility } from './date-utility.mjs';
import { MySQLClient } from './mysql-client.mjs';
import { SequelizeClient } from './sequelize-client.mjs';
import { StringUtility } from './string-utility.mjs';
import { NumberUtility } from './number-utility.mjs';

const app = express();
const port = Number.parseInt(process.env.PORT, 10) || 3000;

const limiter = rateLimit({
    windowMs: 1000 * 60,
    limit: 100,
    standardHeaders: 'draft-8',
    legacyHeaders: false,
    ipv6Subnet: 56
});

app.disable('x-powered-by');

app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: [
                "'self'"
            ],
            scriptSrc: [
                "'self'",
                'https://cdn.jsdelivr.net/npm/bootstrap@5.3.8/',
                'https://cdn.jsdelivr.net/npm/p5@1.11.12/'
            ]
        }
    }
}));
app.use(cors());
app.use(limiter);
app.use(express.static('public'));
app.use(express.json({ limit: '1mb' }));
app.set('view engine', 'ejs');
app.set('views', 'views');

const supportedDbClients = {
    mysql: MySQLClient,
    sequelize: SequelizeClient
};

const dbClientType = (process.env.DATABASE_TYPE ?? 'mysql').trim().toLowerCase();

if (!(dbClientType in supportedDbClients)) {
    throw new Error(`Unsupported DATABASE_TYPE: ${dbClientType}. Supported values are: ${Object.keys(supportedDbClients).join(', ')}`);
}

const db = supportedDbClients[dbClientType];
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
    const limit = NumberUtility.parseInteger(request.query.limit) ?? 100;
    const result = await db.queryMostRecentTiles(limit);

    if (result.status === 200) {
        return response.render('tiles', { title: 'Most Recent Tiles', hexColors: result.data });
    } else if (result.status === 400 || result.status === 500) {
        return response.status(result.status).send(result.message);
    }
});

app.get('/tiles', async (request, response) => {
    const result = await db.queryTilesByDate(DateUtility.getCurrentDate());

    if (result.status === 200) {
        return response.render('tiles', { title: "Today's Tiles", hexColors: result.data });
    } else if (result.status === 400 || result.status === 500) {
        return response.status(result.status).send(result.message);
    }
});

app.get('/tiles/:date', async (request, response) => {
    const requestDate = request.params.date;

    if (!DateUtility.isValidDate(requestDate)) {
        return response.status(400).send('Bad Request: Invalid date. Accepted date format: YYYY-MM-DD.');
    }

    const result = await db.queryTilesByDate(requestDate);

    if (result.status === 200) {
        return response.render('tiles', { title: 'Tiles by Day', hexColors: result.data });
    } else if (result.status === 400 || result.status === 500) {
        return response.status(result.status).send(result.message);
    }
});

app.get('/api/random-color', async (request, response) => {
    const minR = NumberUtility.parseInteger(request.query.minR);
    const maxR = NumberUtility.parseInteger(request.query.maxR);
    const minG = NumberUtility.parseInteger(request.query.minG);
    const maxG = NumberUtility.parseInteger(request.query.maxG);
    const minB = NumberUtility.parseInteger(request.query.minB);
    const maxB = NumberUtility.parseInteger(request.query.maxB);

    if (
        (request.query.minR && !ColorGenerator.isValidColorComponent(minR))
        || (request.query.maxR && !ColorGenerator.isValidColorComponent(maxR))
        || (request.query.minG && !ColorGenerator.isValidColorComponent(minG))
        || (request.query.maxG && !ColorGenerator.isValidColorComponent(maxG))
        || (request.query.minB && !ColorGenerator.isValidColorComponent(minB))
        || (request.query.maxB && !ColorGenerator.isValidColorComponent(maxB))
    ) {
        return response.status(400).json({ error: 'Invalid query parameters. Parameters must be integers between 0 and 255.' });
    }

    let colorHex;

    try {
        colorHex = ColorGenerator.getHexColor({ minR, maxR, minG, maxG, minB, maxB });
    } catch (error) {
        return response.status(400).json({ error: 'Invalid query parameters. All minimum values must be less than their corresponding maximum values.' });
    }

    try {
        const colorData = await ColorGenerator.getColorData(colorHex);

        if (colorData) {
            return response.json(colorData);
        }

        return response.status(400).json({ error: 'Bad Request.' });
    } catch (error) {
        return response.status(500).json({ error: 'Internal Server Error.' });
    }
});

app.post('/api/tile', async (request, response) => {
    const requestColorHex = request.body.colorHex;

    if (!StringUtility.isHexColor(requestColorHex)) {
        return response.status(400).send('Bad Request: Invalid colorHex string.');
    }

    const result = await db.insertTile(requestColorHex);

    if (result.status === 200) {
        return response.json({ message: result.message });
    } else if (result.status === 400 || result.status === 500) {
        return response.status(result.status).json({ error: result.message });
    }
});

app.use((request, response, next) => {
    response.status(404).send('Error 404: Not Found.');
});

app.use((error, request, response, next) => {
    console.error(error);
    response.status(500).send('Error 500: Internal Server Error.');
});

app.listen(port, () => {
    console.log(`Application listening at port ${port}`);
});
