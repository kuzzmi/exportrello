const express = require('express');
const router = express.Router();

// Router
router.get('/', (req, res) => {
    res.json({
        foo: 'bar',
    });
});

module.exports = router;
