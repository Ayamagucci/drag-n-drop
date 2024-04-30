// CLI: "webpack --config [ desired config file ]"

const path = require('path');
const { CleanWebpackPlugin } = require('clean-webpack-plugin'); // cleans build folder before writing new bundle

module.exports = {
  mode: 'production',
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
    filename: 'bundle.js',
    path: path.resolve(__dirname, 'dist'),
    publicPath: '/dist/'
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
  devtool: 'inline-source-map',
  plugins: [
   new CleanWebpackPlugin()
  ]
};