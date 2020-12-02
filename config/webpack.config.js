'use strict';

const path = require('path');
const fs = require('fs');

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
  module: {}
}
