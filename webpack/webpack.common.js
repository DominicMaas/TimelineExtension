const path = require('path');

module.exports = {
    entry: {
        background: path.join(__dirname, '../src/scripts/background.ts'),
        menu: path.join(__dirname, '../src/scripts/menu.ts'),
        timeline: path.join(__dirname, '../sr/scripts/timeline.ts')
    },
    output: {
        path: path.join(__dirname, '../extension/scripts'),
        filename: '[name]-complied.js'
    },
    optimization: {
        splitChunks: {
            name: 'vendor',
            chunks: "initial"
        }
    },
    module: {
        rules: [
            {
                test: /\.tsx?$/,
                use: 'ts-loader',
                exclude: /node_modules/
            }
        ]
    },
    resolve: {
        extensions: ['.ts', '.tsx', '.js']
    }
};