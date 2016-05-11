var path = require('path')

module.exports = function (config) {
  config.set({
    browsers: ['PhantomJS'],
    frameworks: ['mocha', 'sinon-chai'],
    files: [
      '../node_modules/babel-polyfill/dist/polyfill.js',
      '../test/unit/specs/index.js'
    ],
    preprocessors: {
      '../test/unit/specs/index.js': ['webpack', 'sourcemap']
    },
    webpack: {
      devtool: 'source-map',
      resolve: {
        alias: {
          'src': path.resolve(__dirname, '../src')
        }
      },
      module: {
        loaders: [{
          test: /\.js$/,
          exclude: /node_modules|vue\/dist/,
          loader: 'babel',
          query: {
            presets: ['es2015'],
            plugins: [
              ['babel-plugin-espower']
            ]
          }
        }],
        postLoaders: [{
          test: /\.json$/,
          loader: 'json'
        }, {
          test: /\.js$/,
          exclude: /test|node_modules|vue\/dist/,
          loader: 'istanbul-instrumenter'
        }]
      }
    },
    webpackMiddleware: {
      noInfo: true
    },
    browserDisconnectTimeout: 5000,
    reporters: [
      'mocha', 'coverage'
    ],
    coverageReporter: {
      reporters: [
        {type: 'lcov', dir: '../test/unit/coverage'},
        {type: 'text-summary', dir: '../test/unit/coverage'}]
    }
  })
}
