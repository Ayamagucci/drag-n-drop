/* TSCONFIG
  Considerations: target, module, outDir
  • NOTE: changed module to "ES6"
    (from "CommonJS")

  rootDir no longer necessary
*/

// NOTE: webpack config == always CommonJS (despite TSC module) **
const path = require('path');

module.exports = {
  mode: 'development',
  entry: './src/app.ts',
  devServer: {
    static: [
      {
        directory: path.join(__dirname)
      }
    ]
  },
  output: {
    filename: 'bundle.js',
    path: path.resolve(__dirname, 'dist'), // absolute path to outDir
    publicPath: '/dist/'
  },
  module: {
    rules: [
      {
        test: /\.ts$/, // checks if rule should apply
        use: 'ts-loader',
        exclude: /node_modules/ // NOTE: good general exclusion
      }
    ]
  },
  resolve: {
    extensions: [ '.ts', '.js' ]
  },
  devtool: 'inline-source-map' // bundles TS source maps
};

/* ADDITIONAL NOTES
  • CLI —> "webpack-dev-server"

  • can also use dynamic parts (e.g. "bundle.[contenthash].js")
*/