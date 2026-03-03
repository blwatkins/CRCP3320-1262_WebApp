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

app.get('/api/random-color', (request, response) => {
    const hexColor = ColorGenerator.getHexColor();
    response.json({ hexColor });
});

app.listen(port, () => {
    console.log(`Application listening at port ${port}`);
});
