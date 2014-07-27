var npm      = require('npm-stats')()
var nresolve = require('resolve')
var request  = require('request')
var semver   = require('semver')
var path     = require('path')
var zlib     = require('zlib')
var tar      = require('tar')
var fs       = require('fs')

module.exports = npmfile

// TODO: don't query for ranges with fixed versions
// TODO: cache version queries for ~600s

function npmfile(cache, resolve) {
  cache   = path.resolve(cache || path.join(process.cwd(), '.npm-files'))
  resolve = resolve || nresolve

  return function(module, version, filename, next) {
    if (version === 'latest') version = '*'
    if (!semver.validRange(version)) return next(new Error(
      'Invalid version range supplied: "'+version+'"'
    ))

    if (!/^[!-~]+$/i.test(module) || module.indexOf(path.sep) !== -1) {
      return next(new Error('Invalid module name: "'+module+'"'))
    }

    filename = String(filename).split(path.sep).filter(function(d) {
      return d !== '.' && d !== '..'
    }).join(path.sep)

    npm.module(module).info(function(err, data) {
      if (err) return next(err)
      if (!data) return next(new Error('No data available for "'+module+'"'))
      if (!data.versions) return next(new Error(
        'No versions available for "'+module+'"'
      ))

      var versions = Object.keys(data.versions)
      var latest   = semver.maxSatisfying(versions, version)

      getFile(module, latest, filename, next)
    })
  }

  function getFile(module, version, filename, next) {
    var moduleDir  = path.join(cache, module)
    var versionDir = path.join(moduleDir, version)
    var pkgDir     = path.join(versionDir, 'package')
    var pkgFile    = path.join(pkgDir, 'package.json')

    fs.exists(pkgFile, function(exists) {
      if (exists) return resolveIt()

      request.get('http://registry.npmjs.org/'+module+'/'+version, {
        json: true
      }, function(err, _, json) {
        if (err) return next(err)

        var tarballURL = json && json.dist && json.dist.tarball
        if (!tarballURL) return next(new Error(
          'No tarball URL available for "'+module+'"'
        ))

        request.get(tarballURL)
          .pipe(zlib.createGunzip())
          .pipe(tar.Extract({ path: versionDir }))
          .once('end', function() {
            return resolveIt()
          })
      })
    })

    function resolveIt() {
      resolve('./' + filename, {
        basedir: pkgDir
      }, next)
    }
  }
}
