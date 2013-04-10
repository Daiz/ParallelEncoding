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

  suite("Directories", function() {

    test("Creation works", function(finished) {
      fs.mkdir("./test/directory").then(
      function(done) {
        done.should.equal(true);
      }, function(err) {
        should.not.exist(err);
      }).done(finished);
    });

    test("Removal works", function(finished) {
      fs.rmdir("./test/directory").then(
      function(done) {
        done.should.equal(true);
      }, function(err) {
        should.not.exist(err);
      }).done(finished);
    });

    test("Can't remove a non-existent directory", function(finished) {
      fs.rmdir("./test/directory").fail(
        function(err) {
          should.exist(err);
        }
      ).done(finished);
    });

  });

});