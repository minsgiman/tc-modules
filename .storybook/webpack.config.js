const ForkTsCheckerWebpackPlugin = require('fork-ts-checker-webpack-plugin');

module.exports = async ({ config, mode }) => {
    config.resolve.extensions.push('.ts', '.tsx', '.vue', '.css', '.less', '.scss', '.sass', '.html');
    config.module.rules.push({
        test: /\.ts$/,
        exclude: /node_modules/,
        use: [
            {
                loader: 'ts-loader',
                options: {
                    appendTsSuffixTo: [/\.vue$/],
                    transpileOnly: true // used with ForkTsCheckerWebpackPlugin
                },
            }
        ],
    });

    config.module.rules.push({ test: /\.less$/, loaders: ['style-loader', 'css-loader', 'less-loader'] });

    config.plugins.push(new ForkTsCheckerWebpackPlugin());

    return config;
};