const path = require('path');
const webpack = require('webpack');
const root = (...args) => path.resolve(__dirname, ...args);

const devServer = {
  contentBase: root('./server'),
  inline: true,
  port: 1994,
  host: '0.0.0.0'
}

const dev_entry = {
  app: './server/main.ts'
}

const prod_entry = {
  index: './src/index.ts'
}

const output = {
  filename: '[name].js',
  path: root('./dist'),
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

const generate_config = (mode) => {
  const is_dev = mode === 'development';
  const config = {
    mode,
    output,
    entry: is_dev ? dev_entry : prod_entry,
    resolve: {
      extensions: ['.ts', '.js', '.glsl']
    },
    module: {
      rules
    },
    plugins,
    devServer
  };

  if (is_dev) {
    config.devtool = 'source-map';
  }

  return config;
};

module.exports = (env, argv) => {
  return generate_config(argv.mode || 'development');
};

