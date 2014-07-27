# npm-file [![experimental](http://badges.github.io/stability-badges/dist/experimental.svg)](http://github.com/badges/stability-badges)

Specify a path within an npm package: download and extract it, returning a
local path for reading.

## Usage

[![NPM](https://nodei.co/npm/npm-file.png)](https://nodei.co/npm/npm-file/)

### get = npmfile(cache, resolve)

Returns a function you can use to get files from packages on npm. Takes the
following arguments, both of which are optional:

* `cache`: the directory to store modules on the filesystem. Defaults to
  `.npm-files`.
* `resolve`: a custom module resolution function. Defaults to
  [resolve](http://github.com/substack/node-resolve), and expects the same
  function signature.

``` javascript
var resolve  = require('glsl-resolve')
var cachedir = __dirname + '/.cache'
var getnpm   = require('npm-file')(cachedir, resolve)
```

### get(package, version, filename, got)

Retrieves a file from npm. Takes the following arguments:

* `package`: the name of the package on npm.
* `version`: a semver version range. May also be a fixed version, or `*` or
  `latest`.
* `filename`: the module in the package to retrieve. Uses the previously defined
  `resolve` function, so you can omit file extensions if you so please.
* `got(err, path)`: is called when complete, returning the file path of the
  target module.

## License

MIT. See [LICENSE.md](http://github.com/hughsk/npm-file/blob/master/LICENSE.md)
for details.
