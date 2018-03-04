/*!
 * OS.js - JavaScript Cloud/Web Desktop Platform
 *
 * Copyright (c) 2011-2018, Anders Evenrud <andersevenrud@gmail.com>
 * All rights reserved.
 *
 * Redistribution and use in source and binary forms, with or without
 * modification, are permitted provided that the following conditions are met:
 *
 * 1. Redistributions of source code must retain the above copyright notice, this
 *    list of conditions and the following disclaimer
 * 2. Redistributions in binary form must reproduce the above copyright notice,
 *    this list of conditions and the following disclaimer in the documentation
 *    and/or other materials provided with the distribution
 *
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND
 * ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
 * WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
 * DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT OWNER OR CONTRIBUTORS BE LIABLE FOR
 * ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
 * (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
 * LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND
 * ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
 * (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS
 * SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 *
 * @author  Anders Evenrud <andersevenrud@gmail.com>
 * @licence Simplified BSD License
 */

const fs = require('fs');
const path = require('path');
const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const cliRoot = path.dirname(__dirname);

const baseWebpackConfiguration = (dir, options = {}) => {
  const realDir = fs.realpathSync(dir);

  options = Object.assign({
    mode: 'development',
    context: realDir,
    splitChunks: false,
    runtimeChunk: false,
    title: 'OS.js',
    template: null,
    minimize: false,
    sourceMap: true,
    devtool: 'source-map',
    exclude: /(node_modules|bower_components)/,
    outputPath: path.resolve(dir, 'dist'),
    entry: {},
    plugins: [],
    babel: {
      cacheDirectory: true,
      presets: ['@babel/preset-env'],
      plugins: [
        '@babel/transform-runtime'
      ]
    },
    includePaths: [
      path.resolve(realDir, 'node_modules'),
      path.resolve(cliRoot, 'node_modules')
    ]
  }, options);

  if (!options.sourceMap) {
    options.devtool = false;
  }

  const htmlOptions = {
    title: options.title
  };

  if (options.template) {
    htmlOptions.template = options.template;
  }

  const defaults = {
    mode: options.mode,
    devtool: options.devtool,
    context: options.context,
    plugins: [
      new ExtractTextPlugin('[name].css'),
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
    module: {
      rules: [
        {
          test: /\.(png|jpg|gif)$/,
          use: [
            {
              loader: require.resolve('file-loader'),
              options: {}
            }
          ]
        },
        {
          test: /\.s?css$/,
          use: ExtractTextPlugin.extract({
            fallback: {
              loader: require.resolve('style-loader')
            },
            use: [
              {
                loader: require.resolve('css-loader'),
                options: {
                  minimize: options.minimize,
                  sourceMap: options.sourceMap
                }
              },
              {
                loader: require.resolve('sass-loader'),
                options: {
                  minimize: options.minimize,
                  sourceMap: options.sourceMap,
                  includePaths: options.includePaths
                }
              }
            ]
          })
        },
        {
          test: /\.js$/,
          exclude: options.exclude,
          include: options.includePaths,
          use: {
            loader: require.resolve('babel-loader'),
            options: options.babel
          }
        }
      ]
    }
  };

  if (options.template) {
    defaults.plugins.push(new HtmlWebpackPlugin(htmlOptions));
  }

  return defaults;
};

const packageWebpackConfiguration = (dir, args, options = {}) =>
  baseWebpackConfiguration(dir, Object.assign({
    outputPath: path.resolve(args.publicPath, 'packages', path.basename(dir))
  }, options));

const logger = (err, status, cb) => {
  if (err) {
    console.error(err.stack || err);
  } else {
    console.log(status.toString({
      version: false,
      modules: false,
      chunks: false,
      colors: true
    }));
  }
};

const build = (configurations, cb) => webpack(configurations)
  .run((err, status) => logger(err, status, cb))

const watch = (configurations, options, cb) => webpack(configurations)
  .watch(options, (err, status) => logger(err, status, cb));

const buildManifest = (dir, data, options = []) => {
  const json = JSON.stringify(data);
  return fs.writeFileSync(dir, json);
};

module.exports = {
  baseWebpackConfiguration,
  packageWebpackConfiguration,
  build,
  watch,
  webpack,
  buildManifest
};
