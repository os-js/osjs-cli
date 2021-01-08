# Changelog for osjs-cli

## 3.0.28 - 2021-01-08

* Updated dependencies
* Updated application server example

## 3.0.27 - 2020-02-11

* Updated templates ES style

## 3.0.26 - 2020-11-26

* Updated application examples
* Updated dependencies

## 3.0.25 - 2020-08-15

* Updated dependencies
* Updated README
* Updated application scaffold template
* Added timestamps to CHANGELOG.md

## 3.0.23 - 2020-02-16

* Some improvements to package discovery

## 3.0.22 - 2020-02-16

* Now using @osjs/dev-meta in templates

## 3.0.21 - 2020-02-11

* Fixed package discovery on Windows (#12)

## 3.0.19 - 2020-01-19

* Updated .travis.yml
* Updated package.json scripts
* Updated linter configurations in application templates
* Updated dependencies
* Updated application template dotfiles
* Updated application template dependencies
* Updated eslint rules
* Updated README badges
* Updated codeclimate ignores
* Updated package.json files section
* Removed unused watch:all task
* Removed deprecated 'make:package' task
* Added unit tests
* Scaffold tasks can now be done without interactive wizard
* Updated 'args' passed to tasks
* Split up some source code

## 3.0.18 - 2019-05-05

* Added 'info' task

## 3.0.17 - 2019-04-30

* Added support for overriding package metadata
* Cleaned up discover task
* Refactored initial config loading
* Remove deprecated cli config lookup

## 3.0.16 - 2019-04-16

* Updated dependencies
* Updated Auth adapter scaffolding templates
* Updated dependencies for scaffolding templates
* Replaced signale with consola and updated logging

## 3.0.15 - 2019-04-08

* Updated dependencies
* Updated application scaffold template
* Added 'iframe-application' template and scaffold task

## 3.0.14 - 2019-03-24

* Updated dependencies
* Add support for relative symlinks in package discovery (fixes #10)

## 3.0.13 - 2019-02-25

* Updated application template

## 3.0.12 - 2019-01-21

* Fixed app scaffolding on Windows

## 3.0.11 - 2019-01-21

* Updated package discovery depth

## 3.0.10 - 2019-01-19

* Added babelrc to application template

## 3.0.9 - 2019-01-19

* Updated depdendencies
* Updated application scaffolding template

## 3.0.8 - 2019-01-06

* Updated README
* Removed unused dependency
* Updated dependencies

## 3.0.7 - 2019-01-01

* Updated application scaffolding template

## 3.0.6 - 2018-12-18

* Added support for 'soft deleting' packages

## 3.0.5 - 2018-12-01

* Added overwrite/replace confirm to 'make:application' (#6)

## 3.0.4 - 2018-11-25

* Updated application template

## 3.0.3 - 2018-11-19

* Discovery file now writes relative paths
* Added support for custom paths in discovery task

## 3.0.2 - 2018-11-19

* Added '--copy' option to 'package:discover'

## 3.0.1 - 2018-11-09

* Don't abort on package discover cleaning (unlink)

## 3.0.0-alpha.51 - 2018-10-25

* Updated application template

## 3.0.0-alpha.50 - 2018-10-24

* Updated application template

## 3.0.0-alpha.49 - 2018-10-16

* Updated 'make:application' scaffolding

## 3.0.0-alpha.48 - 2018-10-14

* Fixed application webpack config template
* Added sound package discovery support

## 3.0.0-alpha.47 - 2018-09-29

* Improved command-line and task handling

## 3.0.0-alpha.46 - 2018-09-28

* npm weirdness workaround

## 3.0.0-alpha.45 - 2018-09-28

* New scaffolding tools

## 3.0.0-alpha.44 - 2018-09-16

* Minor optimization of discovery

## 3.0.0-alpha.43 - 2018-08-26

* Improved discovery override

## 3.0.0-alpha.42 - 2018-08-26

* Hotfix for discovery

## 3.0.0-alpha.41 - 2018-08-26

* Added support for custom CLI config and discovery paths

## 3.0.0-alpha.40 - 2018-08-21

* Updated dependencies
* Removed a deprecatd metadata property
* Removed unused dependency

## 3.0.0-alpha.39 - 2018-08-17

* Make sure package discovery does not go deep
* Added back 'watch:all' task

## 3.0.0-alpha.38 - 2018-08-06

* Support icon packages

## 3.0.0-alpha.37 - 2018-07-26

* Ensure that discovery creates source directories

## 3.0.0-alpha.36 - 2018-07-26

* Fixed package:create errors

## 3.0.0-alpha.35 - 2018-07-24

* Merged 'build:manifest' and 'package:discover' tasks

## 3.0.0-alpha.34 - 2018-07-24

* Updated 'package:create'

## 3.0.0-alpha.33 - 2018-07-24

* Fixed symlink permission errors on windows for discover

## 3.0.0-alpha.32 - 2018-07-24

* Remove old build stuff
* Add source map loader

## 3.0.0-alpha.31 - 2018-07-22

* Better reporting of errors/warnings from build

## 3.0.0-alpha.30 - 2018-07-21

* Fixed babel issues with certain paths

## 3.0.0-alpha.29 - 2018-07-21

* Fixed Babel issues on Windows
* Updated eslintrc

## 3.0.0-alpha.28 - 2018-07-20

* Fix for Babel getting confused about transpiling non-wrinkshrapped @osjs libs

## 3.0.0-alpha.27 - 2018-07-18

* Updated dependencies
* Added travis-ci badge to README
* Lint pass
* Added initial travis-ci config

## 3.0.0-alpha.26 - 2018-07-14

* Updated manifest logging
* Simpler signale logging

## 3.0.0-alpha.25 - 2018-07-14

* Fixed some logging usage errors

## 3.0.0-alpha.24 - 2018-07-09

* Updated dependencies
* Improved logging

## 3.0.0-alpha.23 - 2018-07-03

* Updated dependencies
* Added 'package:create' command
* Removed unused dependency

## 3.0.0-alpha.22 - 2018-06-15

* Changed core webpack config path from 'src/conf/webpack.config.js' to 'src/client/webpack.config.js'

## 3.0.0-alpha.21 - 2018-06-14

* Updated command list printout
* Added 'package:upgrade' task
* Moved osjs-install-package to cli task ('package:install')
* Added 'package:discover' task
* Updated some optimization settings in webpack
* Replaced 'extract-text-webpack-plugin' with 'mini-css-extract-plugin'

## 3.0.0-alpha.20 - 2018-06-07

* Added 'symlinks' option (#3)
* Always compile sourceMaps by default
* Updated dependencies

## 3.0.0-alpha.19 - 2018-06-06

* Separated tasks into separate files
* Handle task rejection
* Support loading external tasks

## 3.0.0-alpha.18 - 2018-05-23

* Package installer now supports any git uri (#1)

## 3.0.0-alpha.17 - 2018-05-12

* Added fileLoader option to webpack config

## 3.0.0-alpha.16 - 2018-05-08

* Solved some issues with installer script and windows

## 3.0.0-alpha.15 - 2018-05-06

* Added npmignore
* Added CHANGELOG

## 3.0.0-alpha.14 - 2018-04-28

* Bugfixes

## 3.0.0-alpha.13 - 2018-04-28

* Added JSX support
* Bufixes

## 3.0.0-alpha.12 - 2018-04-22

* Added --dump-webpack argument
* Removed not needed include paths in webpack config
* Bufixes

## 3.0.0-alpha.11 - 2018-04-15

* Better separation of html webpack plugin options
* Replaced bash script with node equivalent

## 3.0.0-alpha.10 - 2018-04-07

* Create dist dir on manifest creation
* Updated install script
* Pass on webpack methods to package build
* Updated package building

## 3.0.0-alpha.9 - 2018-03-31

* Added engines dependendy to package.json
* Updated default watcher options for webpack
* Dump system information on build task

## 3.0.0-alpha.8 - 2018-03-25

* Simplified Webpack configuration creation

## 3.0.0-alpha.7 - 2018-03-20

* Bugfixes

## 3.0.0-alpha.6 - 2018-03-20

* Added package installation script
* Added filtering arguments for 'build:dist'

## 3.0.0-alpha.5 - 2018-03-19

Initial public release
