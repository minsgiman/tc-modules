var path = require('path');
var utils = require('./utils');
var webpack = require('webpack');
var CopyWebpackPlugin = require('copy-webpack-plugin');

function resolve (dir) {
    return path.join(__dirname, '..', dir)
}

module.exports = {
    entry: {
        "api.min" : './../src/api.js',
        "api.common.min" : './../src/api.common.js',
        "api.esm.min" : './../src/api.esm.js',
        //"test.min" : './../src/main.js'
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
                        js: 'babel-loader?presets[]=es2015',
                        less: 'vue-style-loader!css-loader!less-loader'
                    }
                }
            },
            {
                test: /\.js$/,
                loader: 'babel-loader?presets[]=es2015',
                include: [resolve('src'), resolve('test')]
            },
            {
                test: /\.(png|jpe?g|gif|svg)(\?.*)?$/,
                loader: 'url-loader',
                options: {
                    limit: 10000,
                    name: utils.assetsPath('img/[name].[hash:7].[ext]')
                }
            },
            {
                test: /\.(woff2?|eot|ttf|otf)(\?.*)?$/,
                loader: 'url-loader',
                options: {
                    limit: 10000,
                    name: utils.assetsPath('fonts/[name].[hash:7].[ext]')
                }
            }
        ]
    },
    resolve: {
        extensions: ['.js', '.vue', '.json'],
        alias: {
            '@': resolve('src')
        }
    },
    context: __dirname,
    output: {
        libraryTarget: 'umd',
        path: path.resolve(__dirname, './../dist'),
        filename: '[name].js'
    }
}

if (process.env.NODE_ENV === 'production') {
    module.exports.devtool = '#source-map'
    module.exports.plugins = (module.exports.plugins || []).concat([
        new webpack.DefinePlugin({
            'process.env': {
                NODE_ENV: '"production"'
            }
        }),
        new webpack.optimize.UglifyJsPlugin({
            sourceMap: true,
            compress: {
                warnings: false
            }
        }),
        new webpack.LoaderOptionsPlugin({
            minimize: true
        }),
        new CopyWebpackPlugin([
            {from: './../resources', to: './../dist/resources'}
        ])
    ])
}