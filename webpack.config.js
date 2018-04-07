const path = require("path");
const webpack = require("webpack");
const ProgressBarPlugin = require("progress-bar-webpack-plugin");
const root = (...args) => path.resolve(__dirname, ...args);

function devServer() {
    return {
        contentBase: root("./server"),
        inline: true,
        port: 7666
    }
}

function entries() {
    return {
        main: "./src/Main.ts",
    };
}

function rules() {
    return [
        { test: /\.ts$/, loader: "ts-loader", exclude: /node_modules/ },
        { test: /\.js$/, loader: "babel-loader", exclude: /node_modules/, options: {cacheDirectory: true}},
        { test: /\.glsl$/, loader: "raw-loader", exclude: /node_modules/ }
    ];
}

function plugins() {
    return [
        new ProgressBarPlugin(),
        new webpack.HotModuleReplacementPlugin()
    ];
}

var config = {
    mode: "development",
    entry: entries(),
    watch: true,
    output: {
        filename: "[name].bundle.js",
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
