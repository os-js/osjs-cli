#!/bin/bash
#
# os.js - javascript cloud/web desktop platform
#
# copyright (c) 2011-2018, anders evenrud <andersevenrud@gmail.com>
# all rights reserved.
#
# redistribution and use in source and binary forms, with or without
# modification, are permitted provided that the following conditions are met:
#
# 1. redistributions of source code must retain the above copyright notice, this
#    list of conditions and the following disclaimer
# 2. redistributions in binary form must reproduce the above copyright notice,
#    this list of conditions and the following disclaimer in the documentation
#    and/or other materials provided with the distribution
#
# this software is provided by the copyright holders and contributors "as is" and
# any express or implied warranties, including, but not limited to, the implied
# warranties of merchantability and fitness for a particular purpose are
# disclaimed. in no event shall the copyright owner or contributors be liable for
# any direct, indirect, incidental, special, exemplary, or consequential damages
# (including, but not limited to, procurement of substitute goods or services;
# loss of use, data, or profits; or business interruption) however caused and
# on any theory of liability, whether in contract, strict liability, or tort
# (including negligence or otherwise) arising in any way out of the use of this
# software, even if advised of the possibility of such damage.
#
# @author  anders evenrud <andersevenrud@gmail.com>
# @licence simplified bsd license
#
set -e

repository=$1
dependencies=(npm git jq curl)
manifest="${repository/github.com/raw.githubusercontent.com}"
manifest=$(echo "$manifest" | sed "s/\.git$/\/master\/metadata\.json/")

# Make sure we have required dependencies
for d in $dependencies; do
  if ! [ -x "$(command -v $d)" ]; then
    echo "Command not found: '${d}' is required to use this script"
    exit 1
  fi
done

# Then make sure this is a github repository
if ! [[ $repository = *"github.com"* ]]; then
  echo "This script only supports github URLs"
  exit 1
fi

# Download manifest and resolve destination
name=$(curl -s "$manifest" | jq -r '.name')
destination="src/packages/$name"

if [ -d "$destination" ]; then
  echo "A package already exists in: $destination"
  exit 1
fi

# Clone repository
git clone --recursive $repository $destination

# Install dependencies
(cd src/packages/$name && npm install)

echo "Done. Remember to run:"
echo "- 'npm run build:manifest' to update package manifest"
echo "- 'npm run build:dist' to rebuild sources"
echo "Note: Some packages use server-side scripts, so you'll have to re-load the OS.js server in these cases."
