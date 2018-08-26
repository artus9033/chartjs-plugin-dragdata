const webpack = require('webpack')
const webpackNodeExternals = require('webpack-node-externals')
const path = require('path')

const version = require('./package.json').version

const banner = 'chartjs-plugin-dragData.js\n' +
             'http://chartjs.org/\n' +
             'Version: ' + version + '\n\n' +
             'Copyright 2017 Christoph Pahmeyer\n' +
             'Released under the MIT license\n' +
             'https://github.com/chrispahm/chartjs-plugin-dragData/blob/master/LICENSE.md'

const config = {
  resolveLoader: {
    root: path.join(__dirname, 'node_modules')
  },
  externals: {
    'chart.js': 'Chart'
  },
  module: {
    loaders: [{
      test: /\.js$/,
      exclude: /node_modules/,
      loader: 'babel',
      query: {
        presets: ['es2015'],
      }
    }]
  },
  plugins: [
    new webpack.BannerPlugin(banner),
    new webpack.ProvidePlugin({
      Chart: 'chart.js'
    }),
    new webpack.optimize.UglifyJsPlugin({
      include: /\.min\.js$/,
      minimize: true,
      compress: {
        warnings: false
      }
    })
  ]
}

const dist = Object.assign({}, config, {
  entry: {
    'chartjs-plugin-dragData': './src/index.js',
    'chartjs-plugin-dragData.min': './src/index.js'
  },
  output: {
    path: './dist',
    filename: '[name].js'
  }
})

const assets = Object.assign({}, config, {
  entry: {
    'chartjs-plugin-dragData': './src/index.js',
    'chartjs-plugin-dragData.min': './src/index.js'
  },
  output: {
    path: './docs/assets',
    filename: '[name].js'
  }
})

module.exports = [
  dist, assets
]
