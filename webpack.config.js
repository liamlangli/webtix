const path = require("path");
const webpack = require("webpack");
const root = (...args) => path.resolve(__dirname, ...args);

function devServer() {
  return {
    contentBase: root("./server"),
    inline: true,
    port: 1994,
    host: '0.0.0.0'
  }
}

function entries() {
  return {
    app: "./src/main.ts",
  };
}

function rules() {
  return [
    { test: /\.ts$/, loader: "ts-loader", exclude: /node_modules/ },
    { test: /\.js$/, loader: "babel-loader", exclude: /node_modules/, options: { cacheDirectory: true } },
    { test: /\.glsl$/, loader: "raw-loader", exclude: /node_modules/ }
  ];
}

function plugins() {
  return [
    new webpack.HotModuleReplacementPlugin()
  ];
}

const config = {
  mode: "development",
  entry: entries(),
  output: {
    filename: "[name].js",
    path: root("./build"),
    publicPath: '/dist/'
  },
  devtool: "source-map",
  resolve: {
    extensions: [".ts", ".js", ".glsl"]
  },
  module: {
    rules: rules()
  },
  plugins: plugins(),
  devServer: devServer()
};

module.exports = config;
