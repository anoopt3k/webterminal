const path = require('path');
const htmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
  target: 'web',
  mode: 'development',
  devtool: "source-map",
  entry: {
    app: path.resolve(__dirname, '../src/js/index.js'),
  },
  output: {
    path: path.join(__dirname, '../build'),
    filename: 'js/[name].js',
  },
  plugins: [
    new htmlWebpackPlugin({
      template: path.resolve(__dirname, '../src/index.html'),
    }),
  ],
  resolve: {
    alias: {
      '~': path.resolve(__dirname, '../src'),
    },
  },
  devServer: {
    static: {
      directory: path.join(__dirname, '../build'),
    },
    client: {
      logging: 'error',
    },
    hot: true,
  },
  module: {
    rules: [
      {
        test: /\.mjs$/,
        include: /node_modules/,
        type: 'javascript/auto',
      },
      {
        test: /\.html$/i,
        loader: 'html-loader',
      },
      {
        test: /\.(ico|jpg|jpeg|png|gif|eot|otf|webp|svg|ttf|woff|woff2)(\?.*)?$/,
        type: 'asset'
      },
    ],
  },
};