const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const CopyWebpackPlugin = require("copy-webpack-plugin");

module.exports = {
  entry: "./src/js/signup.js",
  output: {
    path: path.resolve(__dirname, "dist"),
    filename: "main.js",
    clean: true,
  },
  module: {
    rules: [
      {
        test: /\.css$/i,
        use: ["style-loader", "css-loader"],
      },
      {
        test: /\.(png|jpg|gif|svg)$/i,
        type: "asset/resource",
      },
    ],
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: "./pages/signup.html",
      filename: "signup.html",
    }),
    new CopyWebpackPlugin({
      patterns: [
        {
          from: path.resolve(__dirname, "./src/images"),
          to: "images",
        },
        {
          from: path.resolve(__dirname, "./src/css"),
          to: "css",
        },
      ],
    }),
  ],
  devServer: {
    static: "./dist",
    open: true,
    port: 3000,
    historyApiFallback: {
      index: "/signup.html",
    },
  },
  mode: "development",
};
