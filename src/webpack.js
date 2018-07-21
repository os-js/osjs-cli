/*
 * os.js - javascript cloud/web desktop platform
 *
 * copyright (c) 2011-2018, anders evenrud <andersevenrud@gmail.com>
 * all rights reserved.
 *
 * redistribution and use in source and binary forms, with or without
 * modification, are permitted provided that the following conditions are met:
 *
 * 1. redistributions of source code must retain the above copyright notice, this
 *    list of conditions and the following disclaimer
 * 2. redistributions in binary form must reproduce the above copyright notice,
 *    this list of conditions and the following disclaimer in the documentation
 *    and/or other materials provided with the distribution
 *
 * this software is provided by the copyright holders and contributors "as is" and
 * any express or implied warranties, including, but not limited to, the implied
 * warranties of merchantability and fitness for a particular purpose are
 * disclaimed. in no event shall the copyright owner or contributors be liable for
 * any direct, indirect, incidental, special, exemplary, or consequential damages
 * (including, but not limited to, procurement of substitute goods or services;
 * loss of use, data, or profits; or business interruption) however caused and
 * on any theory of liability, whether in contract, strict liability, or tort
 * (including negligence or otherwise) arising in any way out of the use of this
 * software, even if advised of the possibility of such damage.
 *
 * @author  anders evenrud <andersevenrud@gmail.com>
 * @licence simplified bsd license
 */

const fs = require('fs');
const path = require('path');
const webpack = require('webpack');
const merge = require('deepmerge');
const isPlainObject = require('is-plain-object');

const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const OptimizeCSSAssetsPlugin = require('optimize-css-assets-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const {DefinePlugin} = webpack;
const cliRoot = path.dirname(__dirname);
const production = !!(process.env.NODE_ENV || 'development').match(/^prod/);

const createWebpack = (dir, options = {}) => {
  const realDir = fs.realpathSync(dir);

  options = merge({
    mode: 'development',
    context: realDir,
    splitChunks: false,
    runtimeChunk: false,
    minimize: production,
    sourceMap: true,
    symlinks: true,
    devtool: 'source-map',
    include: /@osjs/,
    exclude: /(node_modules|bower_components)/,
    outputPath: path.resolve(dir, 'dist'),
    html: {
      template: null,
      title: 'OS.js'
    },
    define: {
      OSJS_VERSION: null
    },
    entry: {},
    plugins: [],
    copy: [],
    rules: [],
    jsx: false,
    babel: {
      cacheDirectory: true,
      presets: [
        require.resolve('@babel/preset-env')
      ],
      plugins: [
        require.resolve('@babel/plugin-transform-runtime')
      ]
    },
    fileLoader: {},
    includePaths: []
  }, options, {
    isMergeableObject: isPlainObject
  });

  if (!options.sourceMap) {
    options.devtool = false;
  }

  if (options.html.template) {
    options.plugins.push(new HtmlWebpackPlugin(options.html));
  }

  if (options.minimize) {
    options.plugins.push(new OptimizeCSSAssetsPlugin({
      cssProcessorOptions: {
        discardComments: true
      },
    }));
  }

  if (Object.keys(options.define).length) {
    options.plugins.push(new DefinePlugin(Object.keys(options.define).reduce((o, k) => {
      return Object.assign({[k]: JSON.stringify(options.define[k])}, o);
    }, {})));
  }

  if (options.jsx) {
    const p = require.resolve('@babel/plugin-transform-react-jsx');
    options.babel.plugins.push(options.jsx === true ? p : [p, options.jsx]);
  }

  return {
    mode: options.mode,
    devtool: options.devtool,
    context: options.context,
    plugins: [
      new MiniCssExtractPlugin({
        filename: '[name].css',
        chunkFilename: '[id].css'
      }),
      new CopyWebpackPlugin(options.copy),
      ...options.plugins
    ],
    entry: options.entry,
    optimization: {
      minimize: options.minimize,
      splitChunks: options.splitChunks,
      runtimeChunk: options.runtimeChunk
    },
    output: {
      path: options.outputPath,
      sourceMapFilename: '[file].map',
      filename: '[name].js'
    },
    resolve: {
      symlinks: options.symlinks,
      modules: [
        'node_modules',
        path.resolve(realDir, 'node_modules'),
        path.resolve(cliRoot, 'node_modules')
      ]
    },
    module: {
      rules: [
        ...options.rules,
        {
          test: /\.(png|jpe?g|gif|webp)$/,
          use: [
            {
              loader: require.resolve('file-loader'),
              options: options.fileLoader
            }
          ]
        },
        {
          test: /\.(sa|sc|c)ss$/,
          use: [
            MiniCssExtractPlugin.loader,
            {
              loader: require.resolve('css-loader'),
              options: {
                // minimize: options.minimize,
                sourceMap: options.sourceMap
              }
            },
            {
              loader: require.resolve('sass-loader'),
              options: {
                minimize: options.minimize,
                sourceMap: options.sourceMap,
                includePaths: [
                  ...options.includePaths,
                ]
              }
            }
          ]
        },
        {
          test: /\.js$/,
          exclude: options.exclude,
          include: [
            ...options.includePaths,
            options.include,
            dir
          ],
          use: {
            loader: require.resolve('babel-loader'),
            options: options.babel
          }
        },
        {
          test: /\.(eot|svg|ttf|woff|woff2)$/,
          include: /typeface/,
          use: {
            loader: require.resolve('file-loader'),
            options: {
              name: 'fonts/[name].[ext]'
            }
          }
        },
        {
          test: /\.svg$/,
          exclude: /typeface/,
          use: {
            loader: require.resolve('file-loader')
          }
        }
      ]
    }
  };
};

module.exports = {createWebpack, webpack};
