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
    path: path.resolve(__dirname, 'dist'),
    publicPath: '/dist/'
    /* assets (devServer.static) served to this URL from memory
      (NOTE: not written to disk! **)
    */
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
    extensions: [ '.ts' ] // NOTE: webpack resolves ".js" by default
  },
  devtool: 'inline-source-map'
};