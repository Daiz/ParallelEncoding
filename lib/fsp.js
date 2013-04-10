/*jshint node:true */

// this module is a small promise wrapper for various fs functions.

var fs = require('fs'),
    Q  = require('q');

module.exports = fsp;

var fsp = {

  readFile: function(path, opts) {
    var d = Q.defer();

    if(!opts) opts = {};

    fs.readFile(path, opts, function(err, data) {
      if(err) {
        d.reject(new Error(err));
      } else {
        d.resolve(data);
      }
    });
    
    return d.promise;
  },
  exists: function(path) {
    var d = Q.defer();

    fs.exists(path, function(exists) {
      d.resolve(exists);
    });

    return d.promise;
  },

  mkdir: function(path, mode) {
    var d = Q.defer();

    if(!mode) mode = "0777";

    fs.mkdir(path, mode, function(err) {
      if(err) {
        d.reject(new Error(err));
      } else {
        d.resolve();
      }
    });

    return d.promise;
  }

};