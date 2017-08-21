const express = require('express');
const router = express.Router();

const auth = require('./auth.js');
const Trello = require('./trello.js');
const json2csv = require('json2csv');

router.use(auth.isAuthenticated);

router.get('/user', (req, res) => {
    res.json(req.user);
});

router.get('/boards', (req, res) => {
    const { oauth_token } = req.user;
    Trello.get({
        oauth_token,
        endpoint: 'members/me/boards',
    }).then(data => {
        res.json(data);
    });
});

router.get('/boards/:id/export/:format', (req, res) => {
    const { id, format } = req.params;

    Trello.get({
        oauth_token: req.user.oauth_token,
        endpoint: `boards/${id}/cards?pluginData=true&checklists=all&checklist_fields=all`,
    }).then(cards => {
        return cards.map(card => {
            card.pluginData = card.pluginData.map(data => {
                if (data.value) {
                    try {
                        data.value = JSON.parse(data.value);
                    } catch (e) {
                        return data;
                    }
                }
            });
            return card;
        });
    }).then(cards => {
        switch (format) {
            case 'markdown':
                res.render('markdown_list', {
                    cards,
                });
                break;
            case 'csv':
                json2csv({
                    data: cards,
                    fields: ['name', 'pluginData'],
                }, (err, csv) => {
                    console.log(cards);
                    if (err) {
                        throw err;
                    }

                    res.attachment(`board-${id}.csv`);
                    res.send(csv);
                });
                break;
            default:
                res.send(415, 'Unsupported format requested');
        }
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
