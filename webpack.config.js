const path = require("path");

module.exports = {
  mode: "development",
  devtool: "inline-source-map",
  entry: {
    queue: "./client/queue.ts",
    lb: "./client/leaderboard.ts",
    lb_admin: "./client/adminlb.ts",
    room: "./client/room.ts",
    wiki_admin: "./client/wiki_admin.ts",
  },
  output: {
    path: path.resolve(__dirname, "./dist"),
    filename: "[name]-bundle.js", // <--- Will be compiled to this single file
  },
  resolve: {
    extensions: [".ts", ".tsx", ".js"],
    alias: {
      "@util": path.resolve(__dirname, "util"),
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
