const express = require('express');
const router = express.Router();

const auth = require('./auth.js');
const Trello = require('./trello.js');

router.get('/user', auth.isAuthenticated, (req, res) => {
    res.json(req.user);
});

router.get('/boards', auth.isAuthenticated, (req, res) => {
    Trello.get({
        oauth_token: req.user.oauth_token,
        endpoint: 'members/me/boards',
    }).then(data => {
        res.json(data);
    });
});

module.exports = router;
