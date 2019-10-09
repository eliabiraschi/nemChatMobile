const path = require('path')
const webpack = require('webpack')

module.exports = {
  watch: true,
  entry: './src/index.js',
  /*plugins: [
    new webpack.HotModuleReplacementPlugin()
  ],*/
  output: {
      path: path.resolve(__dirname, './www'),
      filename: 'index.js',
  },
  devServer: {
    hot: true,
    contentBase: './www',
    watchOptions: {
      poll: true
    }
  },
  node: {
    fs: 'empty',
    net: 'empty',
    tls: 'empty'
  },
  module: {
    rules: [
      { test: /\.(js|jsx)$/, use: 'babel-loader' },
      { test: /\.css$/, loader: ['style-loader', 'css-loader'] },
      { test: /\.(woff2?|eot|ttf|otf|mp3|wav)(\?.*)?$/, loader: 'file-loader', options: {name: '[name].[ext]?[hash]'} },
      {
        test: /\.less$/,
        use: [{ loader: 'style-loader' }, { loader: 'css-loader' }, { loader: 'less-loader' }]
      },
      {
        test: /\.(png|jpe?g|svg)$/,
        use: 'url-loader?limit=5000&name=img/img-[hash:6].[ext]'
      },
      {
        test: /\.(png|jpe?g)$/,
        use: 'file-loader?name=img/img-[hash:6].[ext]'
      },
      {
        test: /\.html$/,
        use: [{
          loader: 'html-loader?interpolate!',
          options: {
            minimize: true
          }
        }]
      }
    ]
  }
}
