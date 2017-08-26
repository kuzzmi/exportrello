const request = require('request-promise-native');
const { API_KEY } = process.env;
const { normalize } = require('./utils.js');

const cache = {};
const getByName = (obj, str) =>
    typeof str === 'string' && !!obj &&
        str.split('.').reduce((acc, cur) => {
            if (acc === undefined) {
                return acc;
            }
            return acc[cur];
        }, obj);

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
    board.pluginData = board.pluginData ?
        board.pluginData.map(data => {
            if (data.value) {
                try {
                    data.value = JSON.parse(data.value);
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
                checklists: 'all',
                checklist_fields: 'all',
                ...options,
            },
        }).catch(err => {
            throw err;
        });
    },

};

module.exports = API;
