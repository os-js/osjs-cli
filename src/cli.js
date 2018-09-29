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
const figures = require('figures');
const {Signale} = require('signale');
const {version} = require('../package.json');
const commander = require('commander');

const error = msg => {
  console.error(msg);
  process.exit(1);
};

const signale = new Signale({
  types: {
    found: {
      badge: figures.play,
      color: 'green',
      label: 'found'
    }
  }
});

const DEFAULT_TASKS = [
  require('./tasks/watch.js'),
  require('./tasks/discover.js'),
  require('./tasks/scaffold.js')
].reduce((obj, result) => Object.assign({}, result, obj), {});

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
    sounds: path.resolve(options.root, 'dist/sounds'),
    icons: path.resolve(options.root, 'dist/icons'),
    packages: path.resolve(options.root, 'dist/apps'),
    metadata: path.resolve(options.root, 'dist/metadata.json')
  }
}, options);

const createDiscoveryPaths = (options, config) => {
  return [
    ...config.discover || [],
    ...options.config.discover
  ]
    .map(d => path.resolve(d));
};

const cli = async (argv, opts) => {
  const logger = signale.scope('osjs-cli');
  const options = createOptions(opts);
  const loadFile = path.resolve(options.cli, 'index.js');

  let tasks = [];
  if (fs.existsSync(loadFile)) {
    try {
      const c = require(loadFile);

      if (c instanceof Array) {
        tasks = c;
      } else {
        tasks = c.tasks;

        options.config.discover = createDiscoveryPaths(options, c);
      }
    } catch (e) {
      logger.warn('An error occured while loading cli config');
      logger.fatal(new Error(e));
    }
  }

  commander
    .version(version)
    .on('command:*', () => {
      console.error('Invalid command: %s\nSee --help for a list of available commands.', commander.args.join(' '));
      process.exit(1);
    })
    .on('--help', () => {
      console.log('');
      console.log('More information:');
      console.log('- https://manual.os-js.org/v3/guide/cli/');
    });

  loadTasks(tasks, options)
    .then(tasks => {
      Object.keys(tasks).forEach(name => {
        try {
          const current = commander.command(name);
          const i = tasks[name];
          const task = typeof i === 'function'
            ? {action: i}
            : i;

          if (task.options) {
            Object.keys(task.options).forEach(k => {
              current.option(k, task.options[k]);
            });
          }

          if (task.help) {
            current.on('--help', () => task.help);
          }

          current
            .description(task.description)
            .action((args) => {
              const logger = signale.scope(name);

              signale.time(name);

              task.action({logger, options, args})
                .then(() => signale.timeEnd(name))
                .catch(error);
            });
        } catch (e) {
          signale.warn(e);
        }
      });

      if (argv.length < 3) {
        commander.help();
        process.exit(1);
      }

      commander.parse(argv);
    })
    .catch(error);
};

module.exports = cli;
