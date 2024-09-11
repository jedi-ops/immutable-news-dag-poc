const { override, addWebpackAlias, addWebpackPlugin } = require('customize-cra');
const webpack = require('webpack');

module.exports = override(
  addWebpackAlias({
    process: "process/browser"
  }),
  addWebpackPlugin(new webpack.ProvidePlugin({
    process: 'process/browser',
    Buffer: ['buffer', 'Buffer'],
  })),
  (config) => {
    const fallback = config.resolve.fallback || {};
    Object.assign(fallback, {
      "crypto": require.resolve("crypto-browserify"),
      "stream": require.resolve("stream-browserify"),
      "assert": require.resolve("assert"),
      "http": require.resolve("stream-http"),
      "https": require.resolve("https-browserify"),
      "os": require.resolve("os-browserify"),
      "url": require.resolve("url")
    });
    config.resolve.fallback = fallback;
    config.ignoreWarnings = [/Failed to parse source map/];
    return config;
  }
);