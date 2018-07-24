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
const globby = require('globby');
const path = require('path');
const {spawn} = require('child_process');

const manifests = async (file) => {
  return fs.readJson(file)
    .then(json => {
      const promises = json.map(iter => {
        const p = path.resolve(iter, 'metadata.json');
        const meta = require(p);
        return Object.assign({
          _basename: path.basename(path.dirname(p)),
          _path: meta.name,
          type: 'application',
        }, meta);
      });

      return Promise.all(promises);
    });
};

const npmPackages = async (root) => {
  const globs = await globby(root + '/**/package.json');
  const metafilename = dir => path.resolve(dir, 'metadata.json');

  const promises = globs.map(filename => fs.readJson(filename)
    .then(json => ({filename: path.dirname(filename), json})));

  return Promise.all(promises)
    .then(results => results.filter(
      ({filename, json}) => !!json.osjs && json.osjs.type === 'package'
    ))
    .then(results => Promise.all(results.map(
      ({filename, json}) => fs.readJson(metafilename(filename))
        .catch(error => console.warn(error))
        .then(meta => ({meta, filename, json}))
    )))
    .then(results => results.filter(res => !!res));
};

const spawnAsync = (cmd, args, options) => new Promise((resolve, reject) => {
  const child = spawn(cmd, args, Object.assign({}, {
    stdio: ['pipe', process.stdout, process.stderr]
  }, options || {}));
  child.on('close', code => code ? reject(code) : resolve(true));
});


module.exports = {
  npmPackages,
  manifests,
  spawnAsync
};
