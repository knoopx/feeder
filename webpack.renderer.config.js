const path = require("path")

const webpack = require("webpack")
const ExtractCssChunks = require("extract-css-chunks-webpack-plugin")
const HtmlWebpackPlugin = require("html-webpack-plugin")
const purgecss = require("@fullhuman/postcss-purgecss")
const ReactRefreshWebpackPlugin = require("@pmmmwh/react-refresh-webpack-plugin")

const { productName, dependencies } = require("./package.json")

const { version: electronVersion } = require(path.resolve(
  __dirname,
  "node_modules/electron/package.json",
))

const isDevelopment = process.env.WEBPACK_DEV_SERVER === "true"

module.exports = {
  target: "electron-renderer",
  devtool: "eval-source-map",
  mode: isDevelopment ? "development" : "production",
  output: {
    path: path.resolve(__dirname, "dist/electron"),
  },
  entry: {
    renderer: ["./src/renderer/index.css", "./src/renderer/index.jsx"],
  },
  resolve: {
    modules: [
      path.resolve(__dirname, "node_modules"),
      path.resolve(__dirname, "src/renderer"),
    ],
    extensions: [".mjs", ".js", ".jsx"],
  },
  plugins: [
    new webpack.ExternalsPlugin("commonjs", Object.keys(dependencies)),
    new HtmlWebpackPlugin({
      inject: false,
      title: productName,
      template: require("html-webpack-template"),
      appMountId: "root",
    }),
    new ExtractCssChunks(),
    isDevelopment &&
      new ReactRefreshWebpackPlugin({ disableRefreshCheck: true }),
  ].filter(Boolean),
  module: {
    rules: [
      {
        test: /\.jsx?$/,
        include: [path.resolve(__dirname, "src/renderer")],
        use: {
          loader: "babel-loader",
          options: {
            presets: [
              [
                "@babel/preset-env",
                {
                  modules: false,
                  targets: `electron ${electronVersion}`,
                },
              ],
              "@babel/preset-react",
            ],
            plugins: [isDevelopment && "react-refresh/babel"].filter(Boolean),
          },
        },
      },
      {
        test: /\.css$/,
        include: [path.resolve(__dirname, "src/renderer")],
        use: [
          {
            loader: ExtractCssChunks.loader,
            options: {
              hmr: isDevelopment,
              reloadAll: true,
            },
          },
          {
            loader: "css-loader",
            options: { modules: { mode: "global" } },
          },
          {
            loader: "postcss-loader",
            options: {
              plugins: [
                require("postcss-smart-import"),
                require("postcss-nested"),
                require("postcss-simple-vars"),
                require("tailwindcss"),
                !isDevelopment &&
                  purgecss({
                    whitelist: ["html", "body"],
                    content: [
                      path.join(__dirname, "./src/renderer/**/*.{js,jsx,css}"),
                    ],
                    extractors: [
                      {
                        extractor: (content) =>
                          content.match(/[A-Za-z0-9-_:/]+/g),
                        extensions: ["js", "jsx"],
                      },
                    ],
                  }),
              ].filter(Boolean),
            },
          },
        ],
      },
      {
        test: /\.(eot|svg|ttf|woff|woff2)$/,
        use: "file-loader",
      },
    ],
  },
}
