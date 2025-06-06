const ExtractTextPlugin = require('extract-text-webpack-plugin');
const CleanWebpackPlugin = require('clean-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const UglifyJSPlugin = require('uglifyjs-webpack-plugin');
const ProgressBarPlugin = require('progress-bar-webpack-plugin');
const autoprefixer = require('autoprefixer');
const Dotenv = require('dotenv-webpack');
const merge = require('webpack-merge');
const common = require('./webpack.common.js');

const envFile = process.env.ENV_FILE ? process.env.ENV_FILE : '.env.prod';

var config = merge(common, {
  output: {
    publicPath: '/'
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        include: [
          /node_modules\/bech32/,
        ],
        use: {
          loader: 'babel-loader', // special for UglifyJSPlugin
          options: {
            presets: ['es2015'],
          }
        }
      },
      {
        test: /\.(sass|scss)$/,
        use: ExtractTextPlugin.extract({
          use: [
            {
              loader: 'css-loader',
              options: {
                minimize: true
              }
            },
            {
              loader: 'postcss-loader',
              options: {
                plugins: [
                  autoprefixer
                ]
              }
            },
            {
              loader: 'sass-loader'
            }
          ],
          fallback: 'style-loader',
          publicPath: '../../'
        })
      },
    ]
  },
  plugins: [
    new CleanWebpackPlugin(['./build'], {verbose: false}),
    new ProgressBarPlugin(),
    new Dotenv({
      path: envFile,
      safe: true
    }),
    new UglifyJSPlugin({
        uglifyOptions: {
          mangle: {
            reserved: ['BigInteger', 'ECPair', 'Point']
          }
        }
    }),
    new ExtractTextPlugin({
      filename: 'assets/css/all.[contenthash:8].css',
      allChunks: true,
    })
  ],
  devtool: 'source-map'
});

if (process.env.BUILD_TYPE === 'phonegap') {
  var htmlPlugin = config.plugins.find(function(plugin) {
    return plugin instanceof HtmlWebpackPlugin;
  });
  htmlPlugin.options.chunks = ['deviceready'];

  config.entry['deviceready'] = './phonegap/deviceready.js';
  delete config.entry['loader'];

  config.output.publicPath = '';
}

module.exports = config;
