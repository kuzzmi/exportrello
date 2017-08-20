const path = require('path');

module.exports = {
    entry: './client/src/index.js',

    output: {
        path: path.resolve(__dirname, './client/dist'),
        filename: 'bundle.js',
    },

    module: {
        rules: [{
            test: /\.js$/,
            loader: 'babel-loader',
            include: [
                path.resolve(__dirname, './client/src')
            ],
            options: {
                presets: [
                    'react',
                ],
                plugins: [
                    'transform-object-rest-spread',
                ],
            },
        }, {
            test: /\.css$/,
            use: [
                'style-loader',
                'css-loader',
            ],
        }, {
            test: /\.scss$/,
            use: [
                'style-loader',
                'css-loader',
                'sass-loader',
            ],
        }, {
            test: /\.(eot|woff|woff2|ttf|svg|png|jpe?g)$/,
            loader: 'url-loader?limit=30000&name=[name]-[hash].[ext]'
        }],
    },

    devServer: {
        contentBase: path.resolve(__dirname, './client/dist'),
        compress: true,
        port: 8000,
        historyApiFallback: true,
    }
};
