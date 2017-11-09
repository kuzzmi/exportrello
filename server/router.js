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
    const { oauth_token } = req.user;
    const exportedOn = new Date();

    Trello.getBoardById({ oauth_token, id }).then(board => {
        // TODO:
        // Simplify this somehow
        return Trello.getCardsByBoardId({
            oauth_token,
            id,
        }).then(cards => {
            return cards.map(card => {
                // Here we modify the pluginData of a card it a way that it's
                // easier to get data from Custom Fields power-up
                card.pluginData = card.pluginData.map(data => {
                    if (data.value) {
                        try {
                            // Get list of fields as a map with id as key
                            // const normalizedPluginData = normalize(
                            //     board.pluginData[0].value.fields, 'id'
                            // );

                            // Try to parse pluginData value, as Custom Fields
                            // power-up uses JSON stringified
                            const jsonData = JSON.parse(data.value).fields;

                            // Now, trying to replace ids in JSON data with
                            // keys from board pluginData
                            // data.value
                            Object.keys(jsonData).reduce((acc, cur) => {
                                if (board.pluginData[cur]) {
                                    card[board.pluginData[cur].n] = jsonData[cur];
                                }
                                return acc;
                            }, {});

                            // Just in case
                            // data.boardPluginData = normalizedPluginData;
                            return data;
                        } catch (e) {
                            return data;
                        }
                    }
                });
                card.exportedOn = exportedOn;
                return card;
            });
        });
    }).then(cards => {
        switch (format) {
            case 'markdown':
                res.render('markdown_list', {
                    cards,
                });
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
                    data: cards,
                    // Any fields
                    // fields: ['name'],
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

// return Trello.get({
//     oauth_token,
//     endpoint: `boards/${board.id}/lists`,
// }).then(lists => {
//     return Promise.all(lists.map(list => {
//         return Trello.get({
//             oauth_token,
//             endpoint: `lists/${list.id}/cards?pluginData=true`,
//         }).then(cards => {
//                 list.cards = cards;
//                 return list;
//             });
//     }));
// }).then(lists => {
//     board.lists = lists;
//     return board;
// });
