const path = require('path');
const webpack = require('webpack')

module.exports = function(env) {
  const production = process.env.NODE_ENV === 'production';
  console.error('AUTH_0_DOMAIN', process.env.AUTH_0_DOMAIN);
  console.error('AUTH_0_DOMAIN', env);
  return {
    devtool: production ? 'source-maps' : 'eval',
    entry: './js/app.js',
    output: {
      path: path.resolve(__dirname, '../priv/static/js'),
      filename: 'app.js',
      publicPath: '/',
    },
    module: {
      rules: [
        {
          test: /\.jsx?$/,
          exclude: /node_modules/,
          use: {
            loader: 'babel-loader',
          },
        },
        {
          test: /\.css$/,
          use: [ 'style-loader', 'css-loader' ]
        },
        {
          test: /\.(png|svg|jpg|gif)$/,
          use: [
            {
              loader: 'file-loader',
              options: {
                publicPath: '/js'
              }
            }
          ]
        },
      ],
    },
    resolve: {
      modules: ['node_modules', path.resolve(__dirname, 'js')],
      extensions: ['.js', '.jsx'],
    },
    plugins: [
      new webpack.EnvironmentPlugin(['AUTH_0_DOMAIN', 'AUTH_0_CLIENT_ID'])
    ],
  };
};
