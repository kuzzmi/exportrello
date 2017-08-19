const express = require('express');
const app = express();
const path = require('path');

// -------------------------
// Configuration
const bodyParser = require('body-parser');
const morgan = require('morgan');

// logging
app.use(morgan('dev'));

// parsing incoming request bodies
app.use(bodyParser.json());

// -------------------------
// Routing
const router = require('./router.js');
app.use('/api/v1/', router);

// -------------------------
// Errow handling
app.use((err, req, res, next) => {
    res.status(err.status || 500);
    res.json({
        error: {
            message: err.message || 'Unknown error occured',
            error: err,
        },
    });
});

// -------------------------
const { API_KEY } = require('../config.js') || process.env.TRELLO_API_KEY;

const { name } = require('../package.json');

app.get('/auth/trello', (req, res, next) => {
    res.redirect(
        `https://trello.com/1/connect?key=${API_KEY}&name=${name}&return_url=http://localhost:3000/auth/callback`
    );
});

app.get('/auth/callback', (req, res, next) => {
    res.sendFile(path.resolve(__dirname, 'views/callback.html'));
});

app.get('/auth/finish', (req, res, next) => {
    const { oauth_token } = req.query;
    console.log(oauth_token);
    res.json({
        oauth_token,
    });
});

app.listen(3000);
