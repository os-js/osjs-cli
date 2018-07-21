# Changelog for osjs-cli

## 3.0.0-alpha.29

* Fixed Babel issues on Windows
* Updated eslintrc

## 3.0.0-alpha.28

* Fix for Babel getting confused about transpiling non-wrinkshrapped @osjs libs

## 3.0.0-alpha.27

* Updated dependencies
* Added travis-ci badge to README
* Lint pass
* Added initial travis-ci config

## 3.0.0-alpha.26

* Updated manifest logging
* Simpler signale logging

## 3.0.0-alpha.25

* Fixed some logging usage errors

## 3.0.0-alpha.24

* Updated dependencies
* Improved logging

## 3.0.0-alpha.23

* Updated dependencies
* Added 'package:create' command
* Removed unused dependency

## 3.0.0-alpha.22

* Changed core webpack config path from 'src/conf/webpack.config.js' to 'src/client/webpack.config.js'

## 3.0.0-alpha.21

* Updated command list printout
* Added 'package:upgrade' task
* Moved osjs-install-package to cli task ('package:install')
* Added 'package:discover' task
* Updated some optimization settings in webpack
* Replaced 'extract-text-webpack-plugin' with 'mini-css-extract-plugin'

## 3.0.0-alpha.20

* Added 'symlinks' option (#3)
* Always compile sourceMaps by default
* Updated dependencies

## 3.0.0-alpha.19

* Separated tasks into separate files
* Handle task rejection
* Support loading external tasks

## 3.0.0-alpha.18

* Package installer now supports any git uri (#1)

## 3.0.0-alpha.17

* Added fileLoader option to webpack config

## 3.0.0-alpha.16

* Solved some issues with installer script and windows

## 3.0.0-alpha.15

* Added npmignore
* Added CHANGELOG

## 3.0.0-alpha.14

* Bugfixes

## 3.0.0-alpha.13

* Added JSX support
* Bufixes

## 3.0.0-alpha.12

* Added --dump-webpack argument
* Removed not needed include paths in webpack config
* Bufixes

## v3.0.0-alpha.11

* Better separation of html webpack plugin options
* Replaced bash script with node equivalent

## v3.0.0-alpha.10

* Create dist dir on manifest creation
* Updated install script
* Pass on webpack methods to package build
* Updated package building

## v3.0.0-alpha.9

* Added engines dependendy to package.json
* Updated default watcher options for webpack
* Dump system information on build task

## v3.0.0-alpha.8

* Simplified Webpack configuration creation

## v3.0.0-alpha.7

* Bugfixes

## v3.0.0-alpha.6

* Added package installation script
* Added filtering arguments for 'build:dist'

## v3.0.0-alpha.5

Initial public release
