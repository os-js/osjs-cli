/*
 * OS.js - JavaScript Cloud/Web Desktop Platform
 *
 * Copyright (c) 2011-2019, Anders Evenrud <andersevenrud@gmail.com>
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

const clean = (copyFiles, dir) => globby(dir, {deep: 1, onlyDirectories: true})
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

const removeSoftDeleted = (logger, disabled) => iter => {
  if (disabled.indexOf(iter.meta.name) !== -1) {
    logger.warn(iter.meta.name, 'was disabled by config');
    return false;
  }

  if (iter.filename.toLowerCase().match(/\.disabled$/)) {
    logger.warn(iter.meta.name, 'was disabled by directory suffix');
    return false;
  }

  if (iter.meta.disabled === true) {
    logger.warn(iter.meta.name, 'was disabled in metadata');
    return false;
  }

  return true;
};

const uniqueFn = condition => (value, index, arr) => {
  const result = arr.findIndex(iter => {
    return iter.meta.name === value.meta.name;
  }) === index;

  return condition ? result : !result;
};

const action = async ({logger, options, args, commander}) => {
  const dist = options.dist();
  const copyFiles = args.copy === true;
  const relativeSymlinks = !copyFiles && args.relative === true;
  const found = await getAllPackages(options.config.discover);

  const dupes = found.filter(uniqueFn(false));
  if (dupes.length > 0) {
    logger.warn('Duplicate packages were discovered!');
    logger.log(`A total of ${dupes.length} duplicates:`);
    dupes.forEach(pkg => logger.log(` > ${pkg.meta.name}`));
  }

  const packages = found.filter(uniqueFn(true))
    .filter(removeSoftDeleted(logger, options.config.disabled));

  const discovery = packages.map(pkg => pkg.filename)
    .map(filename => path.relative(options.root, filename));

  const manifest = packages.map(({meta}) => {
    const override = options.config.metadata
      ? options.config.metadata.override[meta.name]
      : null;

    if (override) {
      logger.warn(`Metadata for '${meta.name}' was overridden from CLI config!`);
    }

    return Object.assign({}, meta, override || {});
  });

  const discoveryDest = path.resolve(
    args.discover || options.packages
  );

  logger.info('Destination discovery map', discoveryDest);
  logger.info('Destination path', dist.root);
  logger.info('Destination manifest', dist.metadata);

  options.config.discover.forEach(d => logger.info('Including', d));

  const roots = {
    theme: dist.themes,
    icons: dist.icons,
    sounds: dist.sounds
  };

  const discover = () => packages.map(pkg => {
    const d = roots[pkg.meta.type]
      ? path.resolve(roots[pkg.meta.type], pkg.meta.name)
      : path.resolve(dist.packages, pkg.meta.name);

    let s = path.resolve(pkg.filename, 'dist');
    if (relativeSymlinks) {
      s = path.relative(options.root, s);
    }

    return fs.ensureDir(s)
      .then(() => {
        return copyFiles
          ? fs.copy(s, d)
          : fs.ensureSymlink(s, d, 'junction');
      })
      .catch(err => console.warn(err));
  });

  logger.info('Flushing out old discoveries');

  await fs.ensureDir(dist.root);
  await fs.ensureDir(dist.themes);
  await fs.ensureDir(dist.packages);
  await clean(copyFiles, dist.themes);
  await clean(copyFiles, dist.packages);

  logger.info('Discovering packages');

  await Promise.all(discover());
  await fs.writeJson(discoveryDest, discovery);
  await fs.writeJson(dist.metadata, manifest);

  packages.forEach(pkg => {
    logger.log(`[${copyFiles ? 'copy' : 'symlink'}] ${pkg.json.name} as ${pkg.meta.name}`);
  });

  logger.success(packages.length + ' package(s) discovered.');
};

module.exports = {
  'package:discover': {
    description: 'Discovers all installed OS.js packages',
    options: {
      '--copy': 'Copy files instead of creating symlinks',
      '--relative': 'Use relative paths for symlinks',
      '--discover [discover]': 'Discovery output file (\'packages.json\' by default)'
    },
    action
  },
};
