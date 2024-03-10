const path = require('path');

const express = require('express');
const cookieParser = require('cookie-parser');

const jwksRoutes = require('./routes/jwks');
const tweetsRouter = require('./routes/tweets');

const {issueJWT} = require('./middleware/auth');
const {setupDatabase} = require('./database/database');

const app = express();
app.use(cookieParser());
app.use(express.json());

app.disable('x-powered-by');

app.get('/', issueJWT, (req, res) => {
    return res.sendFile(path.resolve('static/index.html'));
})

app.use(express.static('./static'));
app.use('/api/v1/tweets', tweetsRouter);
app.use('/.well-known/jwks.json', jwksRoutes);

app.all('*', (req, res) => {
    return res.status(404).send({
        message: '404 page not found'
    });
});

(async () => {
    await setupDatabase();
    app.listen(1337, '0.0.0.0', () => console.log('Listening on port 1337'));
})();