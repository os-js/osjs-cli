#!/usr/bin/env node
/*!
 *
 * os.js - javascript cloud/web desktop platform
 *
 * copyright (c) 2011-2018, anders evenrud <andersevenrud@gmail.com>
 * all rights reserved.
 *
 * redistribution and use in source and binary forms, with or without
 * modification, are permitted provided that the following conditions are met:
 *
 * 1. redistributions of source code must retain the above copyright notice, this
 *    list of conditions and the following disclaimer
 * 2. redistributions in binary form must reproduce the above copyright notice,
 *    this list of conditions and the following disclaimer in the documentation
 *    and/or other materials provided with the distribution
 *
 * this software is provided by the copyright holders and contributors "as is" and
 * any express or implied warranties, including, but not limited to, the implied
 * warranties of merchantability and fitness for a particular purpose are
 * disclaimed. in no event shall the copyright owner or contributors be liable for
 * any direct, indirect, incidental, special, exemplary, or consequential damages
 * (including, but not limited to, procurement of substitute goods or services;
 * loss of use, data, or profits; or business interruption) however caused and
 * on any theory of liability, whether in contract, strict liability, or tort
 * (including negligence or otherwise) arising in any way out of the use of this
 * software, even if advised of the possibility of such damage.
 *
 * @author  anders evenrud <andersevenrud@gmail.com>
 * @licence simplified bsd license
 *
 */

const os = require('os');
const fs = require('fs-extra');
const which = require('which');
const path = require('path');
const {spawn} = require('child_process');

/*
 * Spawn process
 */
const spawnAsync = (cmd, args, options) => new Promise((resolve, reject) => {
  const child = spawn(cmd, args, Object.assign({}, {
    stdio: ['pipe', process.stdout, process.stderr]
  }, options || {}));
  child.on('close', code => code ? reject(code) : resolve(true));
});

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

/*
 * Install NPM package
 */
const installNpm = (root, src) => {
  throw new Error('Npm modules not yet supported.');
};

/*
 * Run
 */
const run = async (root, args) => {
  const [src] = args;
  if (!src) {
    throw new Error('No source given');
  }

  const isNpm = src => !src.match(/^(http|git)/);
  const method = isNpm(src) ? installNpm : installGit;
  const result = await method(root, src);

  if (result) {
    console.log('\n\nDone... remember: ');
    console.log('- "npm run build:manifest" to update package manifest');
    console.log('- "npm run build:dist" to rebuild sources');
    console.log('- Reload the server as some packages rely on server-side scripts.');
  }
};

// Main
run(process.cwd(), process.argv.splice(2))
  .then(() => process.exit(0))
  .catch(err => {
    console.error(err);
    process.exit(1);
  });
