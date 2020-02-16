# Changelog for osjs-cli

## 3.0.23

* Some improvements to package discovery

## 3.0.22

* Now using @osjs/dev-meta in templates

## 3.0.21

* Fixed package discovery on Windows (#12)

## 3.0.19

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

## 3.0.18

* Added 'info' task

## 3.0.17

* Added support for overriding package metadata
* Cleaned up discover task
* Refactored initial config loading
* Remove deprecated cli config lookup

## 3.0.16

* Updated dependencies
* Updated Auth adapter scaffolding templates
* Updated dependencies for scaffolding templates
* Replaced signale with consola and updated logging

## 3.0.15

* Updated dependencies
* Updated application scaffold template
* Added 'iframe-application' template and scaffold task

## 3.0.14

* Updated dependencies
* Add support for relative symlinks in package discovery (fixes #10)

## 3.0.13

* Updated application template

## 3.0.12

* Fixed app scaffolding on Windows

## 3.0.11

* Updated package discovery depth

## 3.0.10

* Added babelrc to application template

## 3.0.9

* Updated depdendencies
* Updated application scaffolding template

## 3.0.8

* Updated README
* Removed unused dependency
* Updated dependencies

## 3.0.7

* Updated application scaffolding template

## 3.0.6

* Added support for 'soft deleting' packages

## 3.0.5

* Added overwrite/replace confirm to 'make:application' (#6)

## 3.0.4

* Updated application template

## 3.0.3

* Discovery file now writes relative paths
* Added support for custom paths in discovery task

## 3.0.2

* Added '--copy' option to 'package:discover'

## 3.0.1

* Don't abort on package discover cleaning (unlink)

## 3.0.0-alpha.51

* Updated application template

## 3.0.0-alpha.50

* Updated application template

## 3.0.0-alpha.49

* Updated 'make:application' scaffolding

## 3.0.0-alpha.48

* Fixed application webpack config template
* Added sound package discovery support

## 3.0.0-alpha.47

* Improved command-line and task handling

## 3.0.0-alpha.46

* npm weirdness workaround

## 3.0.0-alpha.45

* New scaffolding tools

## 3.0.0-alpha.44

* Minor optimization of discovery

## 3.0.0-alpha.43

* Improved discovery override

## 3.0.0-alpha.42

* Hotfix for discovery

## 3.0.0-alpha.41

* Added support for custom CLI config and discovery paths

## 3.0.0-alpha.40

* Updated dependencies
* Removed a deprecatd metadata property
* Removed unused dependency

## 3.0.0-alpha.39

* Make sure package discovery does not go deep
* Added back 'watch:all' task

## 3.0.0-alpha.38

* Support icon packages

## 3.0.0-alpha.37

* Ensure that discovery creates source directories

## 3.0.0-alpha.36

* Fixed package:create errors

## 3.0.0-alpha.35

* Merged 'build:manifest' and 'package:discover' tasks

## 3.0.0-alpha.34

* Updated 'package:create'

## 3.0.0-alpha.33

* Fixed symlink permission errors on windows for discover

## 3.0.0-alpha.32

* Remove old build stuff
* Add source map loader

## 3.0.0-alpha.31

* Better reporting of errors/warnings from build

## 3.0.0-alpha.30

* Fixed babel issues with certain paths

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
