const path = require('path');
const webpack = require('webpack')
const dotenv = require('dotenv').config( {
  path: path.join(__dirname, '.env')
} );

module.exports = function(env) {
  const production = process.env.NODE_ENV === 'production';
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
      new webpack.EnvironmentPlugin(['AUTH_0_DOMAIN', 'AUTH_0_CLIENT_ID', 'ENV_DOMAIN', 'STRIPE_PUBLIC_KEY', 'SELF_HOSTED', 'INTERCOM_ID_SECRET', 'CONSOLE_VERSION', 'RELEASE_BLOG_LINK'])
      // new webpack.DefinePlugin({
      //   'process.env.AUTH_0_DOMAIN': JSON.stringify(dotenv.parsed.AUTH_0_DOMAIN),
      //   'process.env.AUTH_0_CLIENT_ID': JSON.stringify(dotenv.parsed.AUTH_0_CLIENT_ID),
      //   'process.env.SELF_HOSTED': JSON.stringify(dotenv.parsed.SELF_HOSTED),
      //   'process.env.ENV_DOMAIN': undefined,
      //   'process.env.STRIPE_PUBLIC_KEY': undefined,
      //   'process.env.INTERCOM_ID_SECRET': undefined,
      //   'process.env.CONSOLE_VERSION': undefined,
      // }) // UNCOMMENT FOR OPEN SOURCE RUNNING AND COMMENT OUT ABOVE LINE
    ],
  };
};
