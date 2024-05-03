const path = require('path');

module.exports = {
  mode: 'development',
  entry: './src/app.ts',
  devServer: {
    port: 3000,
    static: [
      {
        directory: path.join(__dirname)
      }
    ]
  },
  output: {
    filename: 'bundle.js', // NOTE: adjust <script> accordingly **
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
    extensions: [ '.ts', '.js' ] // NOTE: remove exts from imports **
  },
  devtool: 'inline-source-map'
};