const express = require('express');
const router = express.Router();

const auth = require('./auth.js');

router.get('/user', auth.isAuthenticated, (req, res) => {
    res.json(req.user);
});

module.exports = router;
