const path = require('path');
const glob = require('glob')
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const ScriptExtHtmlWebpackPlugin = require('script-ext-html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const TerserPlugin = require('terser-webpack-plugin');
const OptimizeCssAssetsPlugin = require('optimize-css-assets-webpack-plugin');

const ENV = process.argv.find(arg => arg.includes('NODE_ENV=production')) ? 'production' : 'development';
console.log(ENV)

const plugins = [];

plugins.push(new CleanWebpackPlugin());
plugins.push(new MiniCssExtractPlugin({
  filename: 'style.css'
}));
const srcDir = './src/pages';
glob.sync("**/*.pug", {
  cwd: srcDir
}).map(key => {
  plugins.push(new HtmlWebpackPlugin({
    meta: [
      {　viewport: 'width=device-width, initial-scale=1'　},
      { 'http-equiv': 'X-UA-Compatible', content: 'IE=edge'}
    ],
    filename: key.replace(/.pug/g, '.html'),
    template: path.resolve(srcDir, key)
  }));
});
plugins.push(new ScriptExtHtmlWebpackPlugin({
  defaultAttribute: 'defer'
}));

const entries = {};
glob.sync("**/*.js", {
  cwd: srcDir
}).map(key => {
  entries[key] = path.resolve(srcDir, key);
});

module.exports = [
  {
    entry: './src/index.js',
    output: {
      filename: 'app.js',
      path: path.resolve(__dirname, 'dist')
    },
  
    // 最適化オプションを上書き
    optimization: {
      minimizer: [
        new TerserPlugin({}),
        new OptimizeCssAssetsPlugin({})
      ]
    },
  
    module: {
      rules: [
        // pug-loaderの設定
        {
          test: /\.pug$/,
          use: [
            {
              loader: 'pug-loader',
              options: ENV !== 'production' ? {
                pretty: true
              } : {}
            }
          ]
        },
  
        // babel-loaderの設定
        {
          test: /\.js$/,
          use: [
            {
              loader: 'babel-loader',
              options: {
                presets: ['@babel/preset-env']
              }
            }
          ],
          exclude: /node_modules/,
        },
  
        // css/sass-loaderの設定
        {
          test: /\.(sa|sc|c)ss$/,
          use: [
            MiniCssExtractPlugin.loader,
            {
              loader: 'css-loader',
              options: {
                url: false
              }
            },
            'sass-loader'
          ]
        }
      ]
    },
    plugins: plugins,
    devtool: 'inline-source-map',
  },
  {
    entry: entries,
    output: {
      filename: '[name]',
      path: path.resolve(__dirname, 'dist')
    },
    optimization: {
      minimizer: [
        new TerserPlugin({})
      ]
    },
    module: {
      rules: [  
        // babel-loaderの設定
        {
          test: /\.js$/,
          use: [
            {
              loader: 'babel-loader',
              options: {
                presets: ['@babel/preset-env']
              }
            }
          ],
          exclude: /node_modules/,
        }
      ]
    }
  }
];