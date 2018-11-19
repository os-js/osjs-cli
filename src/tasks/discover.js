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
const utils = require('../utils.js');
const path = require('path');
const fs = require('fs-extra');
const globby = require('globby');

const isSymlink = file => fs.lstat(file)
  .then(stat => stat.isSymbolicLink());

const clean = (copyFiles, dir) => globby(dir, {deep: false, onlyDirectories: true})
  .then(files => Promise.all(files.map(file => {
    return isSymlink(file)
      .then(sym => {
        return (sym ? fs.unlink(file) : fs.remove(file))
          .catch(err => {
            console.warn(err);
          });
      });
  })));

const getAllPackages = dirs => Promise.all(dirs.map(dir => {
  return utils.npmPackages(dir);
})).then(results => [].concat(...results));

const unique = (logger, found) => found.filter((value, index, arr) => {
  const i = arr.findIndex(iter => {
    return iter.meta.name === value.meta.name;
  }) === index;

  if (!i) {
    logger.warn('Found duplicate of', value.meta.name);
  }

  return i;
});

const action = async ({logger, options, args, commander}) => {
  logger.await('Discovering packages');

  const dist = options.dist();
  const copyFiles = args.copy === true;
  const found = await getAllPackages(options.config.discover);
  const packages = unique(logger, found);
  const discovery = packages.map(pkg => pkg.filename);
  const manifest = packages.map(({meta}) => meta);
  const discoveryDest = path.resolve(
    args.discover || options.packages
  );

  logger.info('Using', discoveryDest);
  logger.info('Using', dist.root);

  options.config.discover.forEach(d => logger.watch('Using', d));

  const roots = {
    theme: dist.themes,
    icons: dist.icons,
    sounds: dist.sounds
  };

  const discover = () => packages.map(pkg => {
    const s = path.resolve(pkg.filename, 'dist');
    const d = roots[pkg.meta.type]
      ? path.resolve(roots[pkg.meta.type], pkg.meta.name)
      : path.resolve(dist.packages, pkg.meta.name);

    return fs.ensureDir(s)
      .then(() => {
        return copyFiles
          ? fs.copy(s, d)
          : fs.ensureSymlink(s, d, 'junction');
      })
      .catch(err => console.warn(err));
  });

  return Promise.resolve()
    .then(() => logger.await('Flushing out old discoveries'))
    .then(() => fs.ensureDir(dist.root))
    .then(() => fs.ensureDir(dist.themes))
    .then(() => fs.ensureDir(dist.packages))
    .then(() => clean(copyFiles, dist.themes))
    .then(() => clean(copyFiles, dist.packages))
    .then(() => logger.await('Discovering packages'))
    .then(() => Promise.all(discover()))
    .then(() => fs.writeJson(discoveryDest, discovery))
    .then(() => fs.writeJson(dist.metadata, manifest))
    .then(() => logger.success(packages.length + ' package(s) discovered.'))
    .then(() => packages.forEach(pkg => logger.info('Discovered', pkg.json.name, 'as', pkg.meta.name, `[${copyFiles ? 'copy' : 'symlink'}]`)));
};

module.exports = {
  'package:discover': {
    description: 'Discovers all installed OS.js packages',
    options: {
      '--copy': 'Copy files instead of creating symlinks',
      '--discover [discover]': 'Discovery output file (\'packages.json\' by default)'
    },
    action
  },
};
