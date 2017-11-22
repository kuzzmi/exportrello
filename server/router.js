const express = require('express');
const router = express.Router();

const auth = require('./auth.js');
const Trello = require('./trello.js');
const json2csv = require('json2csv');

// Enables route-wide authentication
router.use(auth.isAuthenticated);

router.get('/user', (req, res) => {
    res.json(req.user);
});

router.get('/boards', (req, res) => {
    const { oauth_token } = req.user;
    Trello.getUserBoards({ oauth_token }).then(boards => {
        res.json(boards);
    });
});

// TODO:
// Refactor this function to be a bit simpler
router.get('/boards/:id/export/:format', (req, res) => {
    const { id, format } = req.params;
    const { f } = req.query;
    const { oauth_token } = req.user;
    const fields = f ? f.split(',') : ['name', 'listName', 'Est FE', 'Est BE', 'Act FE', 'Act BE', 'exportedOn'];

    Trello.getBoardByIdWithCards({
        oauth_token,
        id,
    }).then(cards => {
        switch (format) {
            case 'markdown':
                res.render('markdown_list', { cards });
                break;
            case 'json':
                // JSON export... Straight-forward
                res.json(cards);
                break;
            case 'csv':
                // Exporting to CSV.
                // If a Custom Fields power-up is available, card object
                // will include fields from the power-up.
                //
                // TODO:
                // fields should be also passed from the client so we can
                // specify what we want to export
                json2csv({
                    data: [
                        ...cards,
                        { name: '---- 8< ----' },
                    ],
                    fields,
                }, (err, csv) => {
                    if (err) {
                        throw err;
                    }

                    // Send back an attachment
                    res.attachment(`board-${id}.csv`);
                    res.send(csv);
                });
                break;
            default:
                // If nothing matched
                res.status(415).send('Unsupported format requested');
        }
    }).catch(err => {
        throw err;
    });
});

module.exports = router;
