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
const os = require('os');
const inspect = require('util').inspect;
const utils = require('../utils.js');
const webpack = require('webpack');

const webpackLogger = (logger, cb) => (err, status) => {
  if (err) {
    logger.warn('An error occured while building');
    logger.fatal(new Error(err.stack || err));
  } else {
    console.log(status.toString({
      version: false,
      modules: false,
      chunks: false,
      colors: true
    }));
  }

  if (typeof cb === 'function') {
    cb();
  }

  if (!err) {
    logger.success('Build successful');
  }
};

const build = (logger, configurations, cb) => webpack(configurations)
  .run(webpackLogger(logger, cb));

const watch = (logger, configurations, options, cb) => webpack(configurations)
  .watch(options, webpackLogger(logger, cb));

module.exports = async ({logger, options, args}) => {
  logger.await('Building dist');
  logger.info(`platform: ${os.platform()} (${os.release()}) arch: ${os.arch()} cpus: ${os.cpus().length} mem: ${os.totalmem()} node: ${process.versions.node}`);

  const webpacks = await utils.webpacks(options, args, logger);
  if (args['dump-webpack']) {
    webpacks.forEach(w => console.log(inspect(w, {depth: null})));
  }

  if (args.watch) {
    logger.watch('Watching with Webpack');

    watch(logger, webpacks, {
      aggregateTimeout: 250,
      ignored: /node_modules/
    }, webpackLogger);
  } else {
    logger.await('Building with Webpack');
    logger.time('webpack');

    build(logger, webpacks, () => logger.timeEnd('webpack'));
  }
};
