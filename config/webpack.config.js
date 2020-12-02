'use strict';

const path = require('path');
const fs = require('fs');
const {CleanWebpackPlugin} = require('clean-webpack-plugin');

const appDirectory = fs.realpathSync(process.cwd());
const resolveApp = (relativePath) => path.resolve(appDirectory, relativePath);
const name = require(resolveApp('package.json')).name
//
module.exports = {
  entry: './src/index.js',
  output: {
    filename: `${name}.js`,
    path: path.resolve(__dirname, '../dist')
  },
  plugins: [
    new CleanWebpackPlugin(),
  ],
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: ['babel-loader'],
      }
    ]
  }
}
