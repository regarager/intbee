const path = require("path");

module.exports = {
  mode: "development",
  devtool: "inline-source-map",
  entry: {
    login: "./client/login.ts",
    queue: "./client/queue.ts",
  },
  output: {
    path: path.resolve(__dirname, "./dist"),
    filename: "[name]-bundle.js", // <--- Will be compiled to this single file
  },
  resolve: {
    extensions: [".ts", ".tsx", ".js"],
    alias: {
      "@common": path.resolve(__dirname, "common"),
      "@server": path.resolve(__dirname, "server"),
    },
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        loader: "ts-loader",
      },
    ],
  },
};
