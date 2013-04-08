/*jshint node:true */

// This module provides a nice wrapper
// for handling child processes.

var spawn = require('child_process').spawn;

module.exports = function(str, data) {
  var self = this;
  for(var k in data) {
    str = str.replace(":"+k,data[k]);
  }
  this.opts = str.split(" ");
  this.name = this.opts.shift();
  this.proc = spawn(this.name, this.opts);
  this.kill = function(code) {
    if(!code) code = 0;
    this.proc.kill(code);
  };
  this.pipe = function(target) {
    this.proc.stdout.on('data', function(data) {
      target.proc.stdin.write(data);
    });
    this.proc.on('close', function() {
      target.proc.stdin.end();
    });
  };
  this.proc.stderr.on('data', function(data) {
    self.on.log(data);
  });
  this.proc.stdout.on('data', function(data) {
    self.on.out(data);
  });
  this.proc.on('close', function() {
    self.on.close();
  });
  this.on = {
    log: function() {return 0;},
    out: function() {return 0;},
    close: function() {return 0;}
  };
};