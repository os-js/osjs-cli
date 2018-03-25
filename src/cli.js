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

const path = require('path');
const utils = require('./utils.js');
const builder = require('./build.js')
const minimist = require('minimist');
const symbols = require('log-symbols');

const tasks = {
  'build:manifest': async ({options, args}) => {
    console.log(symbols.info, 'Making manifest');

    const pkgManifests = await utils.manifests(options.packages);

    pkgManifests.forEach((metadata) => console.log(symbols.success, `${metadata.name}`));

    builder.buildManifest(options.dist.metadata, pkgManifests);
  },

  'build:dist': async ({options, args}) => {
    const publicPath = path.resolve(options.root, 'dist');
    let webpacks = [];

    const packageOnly = !!(args.package || args.packages);
    if (args.core || !packageOnly) {
      const coreConfig = require(options.config);
      webpacks.push(coreConfig);
    }

    const packageFilter = packageOnly
      ? (args.packages
          ? meta => args.packages.indexOf(meta.name) !== -1
          : meta => meta.name === args.package)
      : meta => true;

    if (!args.core || packageOnly) {
      const pkgs = (await utils.manifests(options.packages))
        .filter(packageFilter)
        .map(meta => require(`${options.packages}/${meta._basename}/webpack.js`)(options));

      webpacks = webpacks.concat(pkgs);
    }

    if (args.watch) {
      console.log(symbols.info, 'Watching');
      builder.watch(webpacks);
    } else {
      console.log(symbols.info, 'Building');
      builder.build(webpacks);
    }
  }
};

const cli = async (argv, options) => {
  const args = minimist(argv);
  const [arg] = args._;

  options = Object.assign({}, {
    production: !!(process.env.NODE_ENV || 'development').match(/^prod/),
    config: path.resolve(options.root, 'src/conf/webpack.config.js'),
    packages: path.resolve(options.root, 'src/packages'),
    dist: {
      packages: path.resolve(options.root, 'dist/packages'),
      metadata: path.resolve(options.root, 'dist/metadata.json')
    }
  }, options);

  if (arg in tasks) {
    tasks[arg]({options, args});
  } else {
    console.error('Invalid command', arg);
    process.exit(1);
  }
};

module.exports = cli;
