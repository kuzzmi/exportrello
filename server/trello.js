const request = require('request-promise-native');
const { API_KEY } = process.env;
const { normalize } = require('./utils.js');

const moment = require('moment');

const cache = {};
// const getByName = (obj, str) =>
//     typeof str === 'string' && !!obj &&
//         str.split('.').reduce((acc, cur) => {
//             if (acc === undefined) {
//                 return acc;
//             }
//             return acc[cur];
//         }, obj);

// -------------------------
// Trello API
const get = ({ oauth_token, endpoint, options }) =>
    request({
        uri: `https://api.trello.com/1/${endpoint}`,
        qs: {
            key: API_KEY,
            token: oauth_token,
            ...options,
        },
        json: true,
    });

const processBoard = board => {
    // Tries to parse pluginData values into actual
    // JSON. Needed for getting data from plugins
    board.normalizedLists = normalize(board.lists, 'id');
    board.pluginData = board.pluginData ?
        board.pluginData.map(data => {
            if (data.value) {
                try {
                    data.value = JSON.parse(data.value);
                    data.value.fields = normalize(data.value.fields, 'id');
                    // console.log(data.value);
                    return data;
                } catch (e) {
                    return data;
                }
            }
        }) : [];

    board.pluginData = normalize(board.pluginData, 'idPlugin');
    return board;
};

const API = {
    getCurrentUser: ({ oauth_token, options }) => {
        return get({
            oauth_token,
            options,
            endpoint: 'members/me',
        });
    },

    getUserBoards: ({ oauth_token, options }) => {
        return get({
            oauth_token,
            options: {
                fields: 'id',
                ...options,
            },
            endpoint: 'members/me/boards',
        })
            .then(data => data.map(d => d.id))
            .then(ids => {
                return Promise.all(
                    ids.map(id => {
                        return API.getBoardById({
                            oauth_token,
                            id,
                            options,
                        });
                    })
                ).then(boards => {
                    cache[oauth_token] = {
                        data: {
                            boards: normalize(boards, 'id'),
                        },
                        order: {
                            boards: ids,
                        },
                    };
                    return boards;
                });
            })
            .catch(err => {
                throw err;
            });
    },

    getBoardById: ({ oauth_token, id, options }) => {
        // const cachedBoards = getByName(cache, `${oauth_token}.data.boards`);
        // const cachedBoardIds = getByName(cache, `${oauth_token}.order.boards`);
        // if (cachedBoards) {
        //     return new Promise(resolve => {
        //         resolve(cachedBoardIds.map(id => cachedBoardIds[id]));
        //     });
        // }
        return get({
            oauth_token,
            options: {
                pluginData: true,
                lists: 'open',
                ...options,
            },
            endpoint: `boards/${id}`,
        })
            .then(processBoard)
            .catch(err => {
                throw err;
            });
    },

    getCardsByBoardId: ({ oauth_token, id, options }) => {
        return get({
            oauth_token,
            endpoint: `boards/${id}/cards`,
            options: {
                pluginData: true,
                ...options,
            },
        }).catch(err => {
            throw err;
        });
    },

    getBoardByIdWithCards: ({ oauth_token, id, options }) => {
        const exportedOn = moment().format('YYYY-MM-DD');

        return API.getBoardById({ oauth_token, id }).then(board => {
            return API.getCardsByBoardId({
                oauth_token,
                id,
            }).then(cards => {
                return cards.map(card => {
                    // Here we modify the pluginData of a card in a way that it's
                    // easier to get data from Custom Fields power-up
                    card.pluginData = card.pluginData.map(data => {
                        if (data.value) {
                            try {
                                // Try to parse pluginData value, as Custom Fields
                                // power-up uses JSON stringified
                                const jsonData = JSON.parse(data.value).fields;

                                // Now, trying to replace ids in JSON data with
                                // keys from board pluginData
                                // data.value
                                Object.keys(jsonData).reduce((acc, cur) => {
                                    const localPluginData = board.pluginData[data.idPlugin];

                                    if (localPluginData) {
                                        const fields = localPluginData.value.fields[cur];
                                        if (fields) {
                                            card[fields.n] = jsonData[cur];
                                        }
                                    }
                                    return acc;
                                }, {});

                            } catch (e) {
                                /* eslint no-console:false */
                                console.error('Error converting card pluginData: ', e);
                                /* eslint no-console:true */
                            }

                            return data;
                        }
                    });
                    card.exportedOn = exportedOn;
                    card.listName = board.normalizedLists[card.idList].name;
                    return card;
                });
            });
        });
    },

};

module.exports = API;
