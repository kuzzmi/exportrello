const express = require('express');
const app = express();

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

app.listen(3000);
