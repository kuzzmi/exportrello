module.exports.normalize = (arr, field) => {
    return arr.reduce((acc, cur) => {
        acc[cur[field]] = cur;
        return acc;
    }, {});
};

