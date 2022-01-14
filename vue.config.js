module.exports = {
  publicPath: './',
  productionSourceMap: false,
  configureWebpack: {
    module: {
      rules: [
        {
          test: /\.geoJson$/,
          loader: 'json-loader',
        },
      ],
    },
  },
};
