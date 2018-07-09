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

const inquirer = require('inquirer');
const utils = require('../utils.js');
const path = require('path');
const fs = require('fs-extra');
const {spawnAsync} = require('../utils.js');

const GIT_REPO = 'https://github.com/os-js/osjs-example-application.git';

const replaceInFile = (fromRe, to) => filename => fs.exists(filename)
  .then(() => fs.readFile(filename, 'utf8'))
  .then(content => content.replace(fromRe, to))
  .then(content => fs.writeFile(filename, content));

const filterInput = input => String(input)
  .replace(/[^A-z0-9_]/g, '')
  .trim();

const gitClone = async (src, dest) => spawnAsync('git', ['clone', '--recursive', src, dest]);

module.exports = async ({logger, options, args}) => {
  const destdir = path.resolve(options.root, 'src', 'packages');
  const packages = await utils.manifests(options.packages);

  const answers = await inquirer.prompt([{
    name: 'name',
    message: 'Enter name of package ([A-z0-9_])',
    default: 'MyApplication',
    filter: filterInput,
    validate: input => {
      if (input.length < 1) {
        return Promise.reject('Invalid package name');
      }

      const found = packages.find(meta => meta.name === input);
      if (found) {
        return Promise.reject('A package with this name already exists...');
      }

      return Promise.resolve(true);
    }
  }]);


  const dest = path.join(destdir, answers.name);
  const exists = await fs.exists(dest);
  if (exists) {
    throw new Error(`The destination directory ${dest} already exists`);
  }

  logger.await('Cloning example codebase...');

  await gitClone(GIT_REPO, dest);

  const replacer = replaceInFile(/MyApplication/g, answers.name);

  logger.await('Setting up...');

  await Promise.all([
    fs.remove(path.join(dest, '.git')),
    fs.remove(path.join(dest, 'LICENSE')),
    fs.remove(path.join(dest, 'README.md')),
    fs.remove(path.join(dest, 'package.json'))
      .then(() => {
        return fs.writeJson(path.join(dest, 'package.json'), {
          name: answers.name,
          osjs: {
            type: 'package'
          }
        });
      }),
    replacer(path.join(dest, 'metadata.json')),
    replacer(path.join(dest, 'index.scss')),
    replacer(path.join(dest, 'index.js'))
  ]);

  logger.success('Done...');

  return Promise.resolve(true);
};
