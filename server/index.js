// Reading dotenv file
require('dotenv').config();

const express = require('express');
const app = express();
const path = require('path');

// -------------------------
// Configuration
const bodyParser = require('body-parser');
const morgan = require('morgan');
const cors = require('cors');

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
});

app.get('/user', auth.isAuthenticated, (req, res) => {
    res.json(req.user);
});

app.get('/', (req, res) => {
    res.json(req.user);
});

app.listen(3000);
