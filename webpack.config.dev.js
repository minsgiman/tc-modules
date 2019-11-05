var path = require('path');
var CopyWebpackPlugin = require('copy-webpack-plugin');
var VueLoaderPlugin = require('vue-loader/lib/plugin');

function resolve (dir) {
    return path.join(__dirname, '..', dir)
}

module.exports = {
    entry: {
        "api.min": "./src/comp_test.ts"
    },
    output: {
        libraryTarget: 'umd',
        path: path.resolve(__dirname, './../dist'),
        filename: '[name].js'
    },
    module: {
        rules: [
            {
                test: /\.less$/,
                loader: 'style-loader!css-loader!less-loader'
            },
            {
                test: /\.css$/,
                use: [
                    'vue-style-loader',
                    'css-loader'
                ]
            },
            {
                test: /\.vue$/,
                loader: 'vue-loader',
                options: {
                    loaders: {
                        less: 'vue-style-loader!css-loader!less-loader'
                    }
                }
            },
            {
                test: /\.tsx?$/,
                loader: 'ts-loader',
                exclude: /node_modules/,
                options: {
                    appendTsSuffixTo: [/\.vue$/]
                }
            }
        ]
    },
    resolve: {
        extensions: ['.ts', '.js', '.vue', '.json'],
        alias: {
            '@': resolve('src')
        }
    },
    plugins: [
        new VueLoaderPlugin()
    ],
    context: __dirname
}

module.exports.plugins = (module.exports.plugins || []).concat([
    new CopyWebpackPlugin([
        {from: './resources', to: './dist/resources'}
    ])
])