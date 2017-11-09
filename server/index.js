// Reading dotenv file
require('dotenv').config();

const PORT = 3001;
const express = require('express');
const app = express();

// -------------------------
// Configuration
const bodyParser = require('body-parser');
const morgan = require('morgan');
const cors = require('cors');
const mustacheExpress = require('mustache-express');

// Set mustache as a default renderer
app.engine('mustache', mustacheExpress());
app.set('view engine', 'mustache');
app.set('views', __dirname + '/views');

// CORS middleware
app.use(cors());

// logging
app.use(morgan('dev'));

// parsing incoming request bodies
app.use(bodyParser.json());

// -------------------------
// Authentication
const auth = require('./auth.js');
app.use('/auth', auth.router);
app.use(auth.attachUser);

// -------------------------
// Routing
const router = require('./router.js');
app.use('/api/v1/', router);

// -------------------------
// Error handling
app.use((err, req, res, next) => {
    res.status(err.status || 500);
    res.json({
        error: {
            message: err.message || 'Unknown error occured',
            error: err,
        },
    });
    next();
    throw err;
});

app.listen(PORT);
