const path = require('path');

module.exports = {
    entry: {
        background: path.join(__dirname, '../src/scripts/background.ts'),
        menu: path.join(__dirname, '../src/scripts/menu.ts'),
        timeline: path.join(__dirname, '../src/scripts/timeline.ts'),
        fallbackAuth: path.join(__dirname, '../src/scripts/fallback-auth.ts')
    },
    output: {
        path: path.join(__dirname, '../extension/scripts'),
        filename: '[name].js'
    },
    resolve: {
        extensions: ['.ts', '.tsx', '.js']
    },
    module: {
        rules: [
          // all files with a `.ts` or `.tsx` extension will be handled by `ts-loader`
          { test: /\.tsx?$/, loader: "ts-loader" }
        ]
    }
};