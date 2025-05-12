const path = require("path");

module.exports = {
  mode: "development",
  devtool: "inline-source-map",
  entry: {
    login: "./client/login.ts",
    room: "./client/room.ts",
    register: "./client/register.ts",
    problem: "./client/problem.ts",
    problem_admin: "./client/problem_admin.ts",
    wiki_admin: "./client/wiki_admin.ts",
    queue: "./client/queue.ts",
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
