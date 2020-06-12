const path = require('path');
const webpack = require('webpack');
const root = (...args) => path.resolve(__dirname, ...args);

const mode = 'development';

const devServer = {
  contentBase: root('./server'),
  inline: true,
  port: 1994,
  host: '0.0.0.0'
}

const entry = {
  app: './src/main.ts',
}

const output = {
  filename: '[name].js',
  path: root('./server'),
  publicPath: '/'
}

const rules = [
  { test: /\.ts$/, loader: 'ts-loader', exclude: /node_modules/ },
  { test: /\.js$/, loader: 'babel-loader', exclude: /node_modules/, options: { cacheDirectory: true } },
  { test: /\.glsl$/, loader: 'raw-loader', exclude: /node_modules/ }
]

const plugins = [
  new webpack.HotModuleReplacementPlugin()
];

const config = {
  mode, entry, output,
  devtool: 'source-map',
  resolve: {
    extensions: ['.ts', '.js', '.glsl']
  },
  module: {
    rules
  },
  plugins,
  devServer
};

module.exports = config;
