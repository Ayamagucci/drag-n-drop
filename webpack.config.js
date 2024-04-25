// always exports via CommonJS syntax (despite TSConfig module) **
const path = require('path'); // core Node.js module

module.exports = {
  entry: './src/app.ts',
  output: {
    filename: 'bundle.js',
    path: path.resolve(__dirname, 'dist') // absolute path to outDir
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
  • CLI —> "webpack"

  • can also use dynamic parts (e.g. "bundle.[contenthash].js")
*/