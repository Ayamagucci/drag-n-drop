// bundle —> fewer HTTP reqs —> faster load times

/* TSCONFIG
  Considerations: target, module
  • NOTE: changed module to "ES6"
    (from "CommonJS")

  outDir + rootDir no longer necessary
*/

/* NOTE: typically written in CommonJS syntax
(ES —> add [ "type": "module" ] to package.json) */
const path = require('path');

module.exports = {
  mode: 'development',
  entry: './src/app.ts', // path to TS file
  devServer: {
    port: 3000,
    static: [
      // analogous to express.static()
      {
        directory: path.join(__dirname)
      }
    ]
  },
  output: {
    filename: 'bundle.js', // NOTE: must match script in index.html **
    path: path.resolve(__dirname, 'dist') // ABSOLUTE path to outDir
  },
  module: {
    rules: [
      {
        test: /\.ts$/, // checks if rule should apply
        use: 'ts-loader', // transpiles TS —> JS **
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