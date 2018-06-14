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
const fs = require('fs-extra');
const which = require('which');
const path = require('path');
const {spawnAsync} = require('../utils.js');

/*
 * Runs git clone
 */
const gitClone = async (src, dest) => spawnAsync('git', ['clone', '--recursive', src, dest]);

/*
 * Installs dependencies
 */
const npmInstall = async (cwd) => spawnAsync(which.sync('npm'), ['install'], {cwd});

/*
 * Gets the metadata path
 */
const getMetadataPath = (root, tmpFile) => {
  const src = path.join(tmpFile, 'metadata.json');
  if (!fs.existsSync(src)) {
    throw new Error('Could not find metadata file');
  }

  const metadata = fs.readJsonSync(src);

  if (!metadata || !metadata.name) {
    throw new Error('The package does not contain any relevant OS.js metadata');
  }

  const dest = path.resolve(root, 'src/packages', metadata.name);

  if (fs.existsSync(dest)) {
    throw new Error(`Destination ${dest} already exists`);
  }

  return dest;
};

/*
 * Install GIT package
 */
const installGit = async (root, src) => {
  const tmpDest = path.join(os.tmpdir(), `osjs_${Date.now()}`);

  console.log('Downloading into', tmpDest);

  try {
    const cloneCode = await gitClone(src, tmpDest);
    if (cloneCode !== true) {
      throw new Error('Failed to clone repository. Error code: ' + String(cloneCode));
    }

    const dest = getMetadataPath(root, tmpDest);

    console.log('Installing into', dest);
    fs.copySync(tmpDest, dest);

    const packageJsonFile = path.resolve(dest, 'package.json');
    if (fs.existsSync(packageJsonFile)) {
      console.log('Installing npm dependencies....');

      const depsCode = await npmInstall(dest);
      if (cloneCode !== true) {
        throw new Error('Failed to install dependencies. Error code: ' + String(depsCode));
      }
    }

    return true;
  } catch (err) {
    console.error(err);
  } finally {
    fs.removeSync(tmpDest);
  }

  return false;
};

module.exports = async ({options, args}) => {
  if (args._.length !== 2) {
    throw new Error('You have to specify a package URI');
  }

  const result = await installGit(options.root, args._[1]);

  if (result) {
    console.log('\n\nDone... remember: ');
    console.log('- "npm run build:manifest" to update package manifest');
    console.log('- "npm run build:dist" to rebuild sources');
    console.log('- Reload the server as some packages rely on server-side scripts.');
  }
};
