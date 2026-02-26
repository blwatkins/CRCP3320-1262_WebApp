import express from 'express';
import ejs from 'ejs';

const app = express();
const port = 3000;

app.use(express.static('public'));
app.set('view engine', 'ejs');
app.set('views', 'views');

app.get('/', (request, response) => {
    response.render('index');
});

app.get('/random-color', (request, response) => {
    response.send('hello, world!');
});

app.listen(port, () => {
    console.log(`Application listening at port ${port}`);
});
