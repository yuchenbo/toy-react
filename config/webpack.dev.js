const HtmlWebpackPlugin = require('html-webpack-plugin');
const path = require('path');

const config = {
    mode: 'development',
    optimization: {
        minimize: false
    },
    entry: {
        main: path.resolve(__dirname,'../src/main.js')
    },
    output: {
        path: path.resolve(__dirname,'../dist'),
        filename:'bundle.js'
    },
    module: {
        rules: [
            {
                test: /\.m?js$/,
                exclude: /(node_modules|bower_components)/,
                use: {
                    loader: 'babel-loader',
                    options: {
                        presets: ['@babel/preset-env'],
                        plugins: [["@babel/plugin-transform-react-jsx", {pragma: "ToyReact.createElement"}]]
                    }
                }
            }
        ]
    },
    plugins: [
        new HtmlWebpackPlugin({template: './index.html'})
    ],
    devServer: {
        contentBase: path.join(__dirname, './dist'),
        publicPath: '/',
        port: 3006,
        host: '0.0.0.0',
        proxy: {},
        compress: true,
        historyApiFallback: true,
    }
};
module.exports = config;
