const path = require('path');
//
module.exports = {
  entry: './src/index.js',
  output: {
    filename: 'js-idcard.js',
    path: path.resolve(__dirname, '../dist')
  },
  module: {}
}
