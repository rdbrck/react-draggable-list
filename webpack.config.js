var path = require('path');
module.exports = {
  entry: './src/index.js',
  output: {
    path: path.resolve(__dirname, 'build'),
    filename: 'index.js',
    libraryTarget: 'commonjs2'
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        include: path.resolve(__dirname, 'src'),
        exclude: /(node_modules|bower_components|build)/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['env']
          }
        }
      }
    ],
    loaders: [
      {
        test: /(\.jsx|\.js)$/,
        loader: 'babel',
        exclude: /node_modules/,
        query: {
          cacheDirectory: true,
          presets: ['react', 'stage-0', 'es2015']
        }
      },
      {
        test: /(\.less|\.css)$/,
        loaders: ['style', 'css', 'less']
      },
      {
        test: /(\.json)$/,
        loader: 'json'
      },
      {
        test: /(\.png|\.gif)$/,
        loaders: ['file']
      }
    ]
  },
  externals: {
    'react': 'commonjs react'
  }
};
