const express = require('express');
const router = express.Router();
const path = require('path');
const Trello = require('./trello.js');

// -------------------------
// Authentication and authorization
const { API_KEY } = process.env;
const users = {};

const { name } = require('../package.json');

// Enhance request with user data if a header
// is provided
const attachUser = (req, res, next) => {
    const oauth_token =
        req.headers.authorization || req.query.oauth_token;
    const user = users[oauth_token];

    if (oauth_token && user) {
        req.user = user;
        next();
    } else if (oauth_token && !user) {
        Trello
            .getCurrentUser({ oauth_token })
            .then(data => {
                data.oauth_token = oauth_token;
                users[oauth_token] = data;
                req.user = data;
                next();
            }).catch(err => {
                next(err);
            });
    } else {
        next();
    }
};

const isAuthenticated = (req, res, next) => {
    if (!req.user) {
        next(401, 'Not authenticated');
    } else {
        next();
    }
};

router.get('/trello', (req, res) => {
    if (!req.user) {
        res.redirect(
            `https://trello.com/1/connect?key=${API_KEY}&name=${name}&return_url=http://localhost:3001/auth/callback`
        );
    } else {
        res.render('callback_post.mustache', {
            params: {
                oauth_token: req.user.oauth_token,
            },
            // TODO: fix to a real url
            target: '*',
        });
    }
});

router.get('/callback', (req, res) => {
    res.sendFile(path.resolve(__dirname, 'views/callback.html'));
});

router.get('/finish', attachUser, (req, res) => {
    const { oauth_token } = req.query;
    res.render('callback_post.mustache', {
        params: {
            oauth_token,
        },
        // TODO: fix to a real url
        target: '*',
    });
});

module.exports = {
    router,
    attachUser,
    isAuthenticated,
};
