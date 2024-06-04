const HtmlWebpackPlugin = require("html-webpack-plugin");
const { CleanWebpackPlugin } = require("clean-webpack-plugin");
const path = require("path");
const webpack = require("webpack");

module.exports = {
  mode: "development",
  entry: "./src/index.ts",
  output: {
    filename: "[name].bundle.js",
    pathinfo: false,
    path: path.resolve(__dirname, "dist"),
  },
  optimization: {
    runtimeChunk: true,
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: path.resolve(__dirname, "./public/index.html"),
      filename: "index.html",
      favicon: path.resolve(__dirname, "./public/favicon.ico"),
    }),
    new CleanWebpackPlugin(),
    new webpack.HotModuleReplacementPlugin(),
  ],
  module: {
    rules: [
      {
        test: /\.(ts|tsx)$/i,
        loader: "ts-loader",
        exclude: ["/node_modules/"],
      },
      {
        test: /\.css$/i,
        use: ["style-loader", "css-loader"],
        exclude: ["/node_modules/"],
      },
      {
        test: /\.jpe?g$|\.ico$|\.gif$|\.png$|\.svg$/,
        loader: "file-loader",
        options: {
          name: "[name].[ext]",
        },
        exclude: ["/node_modules/"],
      },
    ],
  },
  resolve: {
    extensions: [".ts", ".tsx", ".js"],
  },
  devServer: {
    static: path.resolve(__dirname, "./dist"),
    port: 8080,
  },
};
