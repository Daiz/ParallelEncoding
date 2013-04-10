/*jshint node:true */

var fs = require('../lib/fsp'),
    should = require('should');


suite("File System with Promises", function() {

  suite("Exists", function() {

    test("./lib/ exists", function() {
      fs.exists("./lib").then(
        function(exists) {
          exists.should.equal(true);
        }
      ).done();
    });

    test("./foo/ doesn't exist", function() {
      fs.exists("./foo").then(
        function(exists) {
          exists.should.equal(false);
        }
      ).done();
    });

  });

});