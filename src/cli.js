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
const path = require('path');
const utils = require('./utils.js');
const builder = require('./build.js')
const webpacker = require('./webpack.js');
const minimist = require('minimist');
const symbols = require('log-symbols');
const inspect = require('util').inspect;

const tasks = {
  'build:manifest': async ({options, args}) => {
    console.log(symbols.info, 'Making manifest');

    const packages = await utils.manifests(options.packages);

    packages.forEach(m => console.log(symbols.success, `${m.name} (${m.type})`));

    builder.buildManifest(options.dist.metadata, packages);
  },

  'build:dist': async ({options, args}) => {
    const publicPath = path.resolve(options.root, 'dist');
    let webpacks = [];

    console.log(symbols.info, 'Starting build process....');
    console.log(`platform: ${os.platform()} (${os.release()}) arch: ${os.arch()} cpus: ${os.cpus().length} mem: ${os.totalmem()} node: ${process.versions.node}`);

    const packages = await utils.manifests(options.packages);

    const concat = list => {
      if (list.length) {
        console.log('Including:');
        list.forEach(p => console.log(`- ${p.name} (${p.type})`));

        const load = p => require(`${options.packages}/${p._basename}/webpack.js`)(
          options,
          webpacker
        );
        webpacks = webpacks.concat(list.map(load));
      }
    };

    const buildEverything = [args.core, args.application, args.applications, args.themes]
      .every(val => typeof val === 'undefined');

    const buildApplications = buildEverything || !!(args.application || args.applications);
    const buildThemes = buildEverything || !!args.themes;
    const buildCore = buildEverything || !!args.core;

    if (buildCore) {
      const coreConfig = require(options.config);
      webpacks.push(coreConfig);
    }

    if (buildApplications) {
      const filter = buildEverything ? meta => true : args.applications
        ? meta => args.applications === '*' || args.applications.split(',').indexOf(meta.name) !== -1
        : meta => meta.name === args.application;

      const applications = packages
        .filter(p => p.type === 'application')
        .filter(filter);

      concat(applications);
    }

    if (buildThemes) {
      const themes = packages
        .filter(p => p.type === 'theme');

      concat(themes);
    }

    if (args['dump-webpack']) {
      webpacks.forEach(w => console.log(inspect(w, {depth: null})));
    }

    if (args.watch) {
      console.log(symbols.info, 'Watching', {
        aggregateTimeout: 250,
        ignored: /node_modules/
      });
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
      themes: path.resolve(options.root, 'dist/themes'),
      packages: path.resolve(options.root, 'dist/apps'), // FIXME: Rename to applications
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
