const express = require('express');
const router = express.Router();
const path = require('path');

const request = require('request-promise-native');

// -------------------------
// Authentication and authorization
const { API_KEY } = process.env;
const users = {};

const { name } = require('../package.json');

// Enhance request with user data if a header
// is provided
const attachUser = (req, res, next) => {
    const oauth_token = req.headers.authorization;
    console.log(req.headers);
    console.log(oauth_token);

    if (oauth_token) {
        req.user = users[oauth_token];
    }

    next();
};

const isAuthenticated = (req, res, next) => {
    if (!req.user) {
        next(401);
    } else {
        next();
    }
};

router.get('/trello', (req, res, next) => {
    if (!req.user) {
        res.redirect(
            `https://trello.com/1/connect?key=${API_KEY}&name=${name}&return_url=http://localhost:3000/auth/callback`
        );
    }
});

router.get('/callback', (req, res, next) => {
    res.sendFile(path.resolve(__dirname, 'views/callback.html'));
});

router.get('/finish', (req, res) => {
    const { oauth_token } = req.query;

    const options = {
        uri: 'https://api.trello.com/1/members/me',
        qs: {
            key: API_KEY,
            token: oauth_token,
        },
        json: true,
    };

    console.log(API_KEY, oauth_token);

    request(options).then(data => {
        data.token = oauth_token;
        users[oauth_token] = data;
        res.send(data);
    }, err => {
        throw err;
    });
});


module.exports = {
    router,
    attachUser,
    isAuthenticated,
};
