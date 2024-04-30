// CLI: "webpack --config [ desired config file ]"

const path = require('path');
const { CleanWebpackPlugin } = require('clean-webpack-plugin'); // cleans build folder before writing new bundle

module.exports = {
  mode: 'production',
  entry: './src/app.ts',
  output: {
    filename: 'bundle.js',
    path: path.resolve(__dirname, 'dist')
  },
  module: {
    rules: [
      {
        test: /\.ts$/,
        use: 'ts-loader',
        exclude: /node_modules/
      }
    ]
  },
  resolve: {
    extensions: [ '.ts', '.js' ]
  },
  devtool: 'source-map', // REC for production (served separately + DL PRN)
  plugins: [
   new CleanWebpackPlugin()
  ]
};