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

module.exports = async ({logger, options, args}) => {
  logger.await('Discovering packages');

  const root = args.root
    ? path.resolve(args.root)
    : path.resolve(options.root);

  const dir = path.resolve(root, 'node_modules');
  const dest = path.resolve(root, 'packages.json');
  const packages = await utils.npmPackages(dir);
  const out = packages.map(pkg => pkg.filename);

  const promises = packages.map(pkg => {
    const s = path.resolve(pkg.filename, 'dist');
    const d = pkg.meta.type === 'theme'
      ? path.resolve(options.dist.themes, pkg.meta.name)
      : path.resolve(options.dist.packages, pkg.meta.name);

    return fs.ensureSymlink(s, d);
  });

  return Promise.all(promises)
    .then(() => {
      return fs.writeJson(dest, out).then(() => {
        packages.forEach(pkg => {
          logger.info('Discovered', pkg.json.name, 'as', pkg.meta.name);
        });

        logger.success(packages.length + ' package(s) discovered.');
      });
    });
};
