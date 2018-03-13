/*!
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
 */

const fs = require('fs');
const webpack = require('webpack');

const logger = (err, status, cb) => {
  if (err) {
    console.error(err.stack || err);
  } else {
    console.log(status.toString({
      version: false,
      modules: false,
      chunks: false,
      colors: true
    }));
  }
};

const build = (configurations, cb) => webpack(configurations)
  .run((err, status) => logger(err, status, cb))

const watch = (configurations, options, cb) => webpack(configurations)
  .watch(options, (err, status) => logger(err, status, cb));

const buildManifest = (dir, data, options = []) => {
  const valid = [].concat(data); // TODO
  const json = JSON.stringify(data);
  fs.writeFileSync(dir, json);
  return valid;
};

module.exports = {
  build,
  watch,
  buildManifest
};
