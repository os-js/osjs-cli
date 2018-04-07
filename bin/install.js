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

const fs = require('fs');
const path = require('path');
const request = require('request');
const {spawn} = require('child_process');

/*
 * Download JSON file
 */
const requestJson = url => new Promise((resolve, reject) => {
  const metadata = request(url, {json: true}, (err, res, body) => {
    return err ? reject(err) : resolve(body);
  });
});

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
const npmInstall = async (cwd) => spawnAsync('npm', ['install'], {cwd});

/*
 * Fetches the metadata from given url
 */
const checkMetadata = async (root, url) => {
  const response = await requestJson(url);
  const {name} = response;
  const dest = `${root}/src/packages/${name}`;

  if (fs.existsSync(dest)) {
    throw new Error(`Destination ${dest} already exists`);
  }

  return dest;
};

/*
 * Install GIT package
 */
const installGit = async (root, src) => {
  if (!src.match(/github\.com/)) {
    throw new Error('Only github packages are supported');
  }

  const metadataFile = src
    .replace('github.com', 'raw.githubusercontent.com')
    .replace(/(\.git)?$/, '/master/metadata.json')

  const dest = await checkMetadata(root, metadataFile);

  console.log('Installing into', dest);

  const cloneCode = await gitClone(src, dest);
  if (cloneCode !== true) {
    throw new Error('Failed to clone repository. Error code: ' + String(cloneCode));
  }

  const packageJsonFile = path.resolve(dest, 'package.json');
  if (fs.existsSync(packageJsonFile)) {
    console.log('Installing npm dependencies....');

    const depsCode = await npmInstall(dest);
    if (cloneCode !== true) {
      throw new Error('Failed to install dependencies. Error code: ' + String(depsCode));
    }
  }
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

  const isNpm = src => !src.match(/^http/);
  const method = isNpm(src) ? installNpm : installGit;
  await method(root, src);

  console.log('\n\nDone... remember: ');
  console.log('- "npm run build:manifest" to update package manifest');
  console.log('- "npm run build:dist" to rebuild sources');
  console.log('- Reload the server as some packages rely on server-side scripts.');
};

// Main
run(process.cwd(), process.argv.splice(2))
  .then(() => process.exit(0))
  .catch(err => {
    console.error(err);
    process.exit(1);
  });
