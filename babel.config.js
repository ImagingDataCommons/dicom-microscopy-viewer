module.exports = {
  presets: [
    [
      "@babel/preset-env",
      {
        targets: {
          browsers: ["ie 11"],
        },
      },
    ],
  ],
  plugins: [
    "babel-plugin-transform-import-meta",
    [
      "@babel/plugin-transform-runtime",
      {
        regenerator: true,
        corejs: 3,
      },
    ],
  ],
};
