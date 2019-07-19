const path = require('path')

const config = {
  entry: './src/index.js',
  mode: 'production',
  module: {
    rules: [
      {
        test: /\.m?js$/,
        exclude: /(node_modules|bower_components)/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-env']
          }
        }
      }
    ]
  }
}

const dist = Object.assign({},config,{
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'chartjs-plugin-dragData.min.js'
  }
})

const assets = Object.assign({},config,{
  output: {
    path: path.resolve(__dirname, 'docs/assets'),
    filename: 'chartjs-plugin-dragData.min.js'
  }
})

module.exports = [
  dist, assets
]
