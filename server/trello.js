const request = require('request-promise-native');
const { API_KEY } = process.env;

// -------------------------
// Trello API

module.exports = {
    get({ oauth_token, endpoint, options }) {
        return request({
            uri: `https://api.trello.com/1/${endpoint}`,
            qs: {
                key: API_KEY,
                token: oauth_token,
                ...options,
            },
            json: true,
        });
    },
};
