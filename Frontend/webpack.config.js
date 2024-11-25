module.exports = {
    // other configuration options...
    module: {
        rules: [
            {
                test: /\.js$/,
                exclude: /node_modules\/(?!chart.js)/,  // Process Chart.js with Babel
                use: {
                    loader: 'babel-loader',
                },
            },
        ],
    },
};
