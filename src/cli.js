/*
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

const fs = require('fs-extra');
const path = require('path');
const minimist = require('minimist');
const figures = require('figures');
const {Signale} = require('signale');

const signale = new Signale({
  types: {
    found: {
      badge: figures.play,
      color: 'green',
      label: 'found'
    }
  }
});

const DEFAULT_TASKS = {
  'package:discover': require('./tasks/discover.js'),
  'package:create': require('./tasks/create.js'),
  'watch:all': require('./tasks/watch.js')
};

const loadTasks = (includes, options) => {
  const tasks = Object.assign({}, DEFAULT_TASKS);
  const promises = includes.map(fn => fn(options));

  return Promise.all(promises)
    .then(results => {
      return results.reduce((list, iter) => {
        return Object.assign({}, list, iter);
      }, tasks);
    });
};

const createOptions = options => Object.assign({
  production: !!(process.env.NODE_ENV || 'development').match(/^prod/),
  cli: path.resolve(options.root, 'src/cli'),
  npm: path.resolve(options.root, 'package.json'),
  packages: path.resolve(options.root, 'packages.json'),
  config: {
    discover: [
      path.resolve(options.root, 'node_modules')
    ]
  },
  dist: {
    root:  path.resolve(options.root, 'dist'),
    themes: path.resolve(options.root, 'dist/themes'),
    icons: path.resolve(options.root, 'dist/icons'),
    packages: path.resolve(options.root, 'dist/apps'),
    metadata: path.resolve(options.root, 'dist/metadata.json')
  }
}, options);

const cli = async (argv, opts) => {
  const logger = signale.scope('osjs-cli');
  const options = createOptions(opts);
  const loadFile = path.resolve(options.cli, 'index.js');
  const args = minimist(argv);
  const [arg] = args._;
  const error = msg => {
    console.error(msg);
    process.exit(1);
  };


  let tasks = [];
  if (fs.existsSync(loadFile)) {
    try {
      const c = require(loadFile);

      if (c instanceof Array) {
        tasks = c;
      } else {
        tasks = c.tasks;

        options.config.discover = [
          ...options.config.discover,
          ...c.discover || []
        ];
      }
    } catch (e) {
      logger.warn('An error occured while loading cli config');
      logger.fatal(new Error(e));
    }
  }

  loadTasks(tasks, options).then(tasks => {
    if (!arg) {
      error('Available tasks: \n' + Object.keys(tasks).map(t => `- ${t}`).join('\n'));
    } else if (arg in tasks) {
      const logger = signale.scope(arg);

      signale.time(arg);

      tasks[arg]({logger, options, args})
        .then(() => signale.timeEnd(arg))
        .catch(error);
    } else {
      error('Invalid command', arg);
    }
  }).catch(error);
};

module.exports = cli;
