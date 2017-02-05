'use strict';

const path = require('path');
const webpack = require('webpack');
const CopyWebpackPlugin = require('copy-webpack-plugin');

module.exports = {
  entry: './src/main.js',
  output: {
    path: path.resolve(__dirname, './dist'),
    publicPath: '/dist/',
    filename: 'build.js'
  },
  resolveLoader: {
    root: path.join(__dirname, 'node_modules'),
  },
  module: {
    loaders: [
      {test: /\.vue$/,  loader: 'vue' },
      {test: /\.css$/,  loader: 'style!css' },
      {test: /\.js$/,   loader: 'babel', exclude: /node_modules/},
      {test: /\.glsl$/, loader: 'webpack-glsl'}
    ]
  },
  devServer: {
    historyApiFallback: true,
    noInfo: true
  },
  devtool: 'inline-source-map'
};

if (process.env.NODE_ENV === 'production') {
  module.exports.devtool = 'source-map';
  module.exports.plugins = (module.exports.plugins || []).concat([
    new webpack.DefinePlugin({'process.env': {NODE_ENV: '"production"'}}),
    new webpack.optimize.UglifyJsPlugin({compress: {warnings: false}}),
    new webpack.optimize.OccurenceOrderPlugin(),
    new CopyWebpackPlugin([
      {from: './assets', to: './assets'}
    ])
  ]);
}
