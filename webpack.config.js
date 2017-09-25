const path = require('path');

const ExtractTextPlugin = require('extract-text-webpack-plugin');

module.exports = {
  entry: {
    layout: './src/layout',
    app: ['babel-polyfill', './src/app'],
    upload: ['babel-polyfill', './src/upload'],
    files: ['babel-polyfill', './src/files']
  },
  output: {
    path: path.resolve(__dirname, 'public'),
    filename: 'js/[name].bundle.js',
    publicPath: '/'
  },
  module: {
    rules: [{
        test: /\.js$/,
        exclude: /node_modules/,
        use: [{
          loader: 'babel-loader',
          options: {
            presets: ['env'],
            plugins: [
              ['transform-react-jsx', { pragma: 'h' }]
            ]
          }
        }]
      },
      {
        test: /\.css$/,
        use: ExtractTextPlugin.extract({
          fallback: 'style-loader',
          use: [{ loader: 'css-loader', options: { importLoaders: 1 } }, 'postcss-loader']
        })
      },
      {
        test: /\.(jpg|jpeg|png|gif|svg)$/,
        use: {
          loader: 'url-loader',
          options: {
            limit: 8192
          }
        }
      }
    ]
  },
  plugins: [
    new ExtractTextPlugin('css/[name].bundle.css')
  ],
  devServer: {
    compress: true,
    publicPath: '/',
    port: 9000,
    proxy: {
      '/api': {
        target: 'http://localhost:3000'
      }
    }
  }
}
