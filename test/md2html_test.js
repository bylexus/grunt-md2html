"use strict";

var grunt = require("grunt");

/*
  ======== A Handy Little Nodeunit Reference ========
  https://github.com/caolan/nodeunit

  Test methods:
    test.expect(numAssertions)
    test.done()
  Test assertions:
    test.ok(value, [message])
    test.equal(actual, expected, [message])
    test.notEqual(actual, expected, [message])
    test.deepEqual(actual, expected, [message])
    test.notDeepEqual(actual, expected, [message])
    test.strictEqual(actual, expected, [message])
    test.notStrictEqual(actual, expected, [message])
    test.throws(block, [error], [message])
    test.doesNotThrow(block, [error], [message])
    test.ifError(value)
*/

exports.md2html = {
  setUp: function(done) {
    // setup here if necessary
    done();
  },
  one_file: function(test) {
    var actFile1 = grunt.file.read("tmp/one_file/output.html"),
      expectedFile1 = grunt.file.read("test/expected/one_file/output.html");

    test.equal(actFile1, expectedFile1);
    test.done();
  },

  multiple_files: function(test) {
    var actFile1 = grunt.file.read("tmp/multiple_files/file1.html"),
      expectedFile1 = grunt.file.read(
        "test/expected/multiple_files/file1.html"
      ),
      actFile2 = grunt.file.read("tmp/multiple_files/file2.html"),
      expectedFile2 = grunt.file.read(
        "test/expected/multiple_files/file2.html"
      );

    test.equal(actFile1, expectedFile1);
    test.equal(actFile2, expectedFile2);
    test.done();
  },

  includes: function(test) {
    var actFile1 = grunt.file.read("tmp/includes/index.html"),
      expectedFile1 = grunt.file.read("test/expected/includes/index.html");

    test.equal(actFile1, expectedFile1);
    test.done();
  },

  highlight: function(test) {
    var actFile1 = grunt.file.read("tmp/highlight/output.html"),
      expectedFile1 = grunt.file.read("test/expected/highlight/output.html");

    test.equal(actFile1, expectedFile1);
    test.done();
  },

  highlight_compressed: function(test) {
    var actFile1 = grunt.file.read("tmp/highlight/output_compressed.html"),
      expectedFile1 = grunt.file.read(
        "test/expected/highlight/output_compressed.html"
      );

    test.equal(actFile1, expectedFile1);
    test.done();
  },

  underscoreTemplating: function(test) {
    var actFile1 = grunt.file.read("tmp/underscore_test/output.html"),
      expectedFile1 = grunt.file.read(
        "test/expected/underscore_test/output.html"
      );

    test.equal(actFile1, expectedFile1);
    test.done();
  },

  plantuml: function(test) {
    var actFile1 = grunt.file.read("tmp/plantuml/output.html"),
      expectedFile1 = grunt.file.read(
        "test/expected/plantuml/output.html"
      );

    test.equal(actFile1, expectedFile1);
    test.ok(grunt.file.exists('tmp/plantuml/myimage.png'));
    test.done();
  },

  plantuml_remote: function(test) {
    var actFile1 = grunt.file.read("tmp/plantuml/output-server.html"),
      expectedFile1 = grunt.file.read(
        "test/expected/plantuml/output-server.html"
      );

    test.equal(actFile1, expectedFile1);
    test.ok(grunt.file.exists('tmp/plantuml/myimage-remote.png'));
    test.done();
  }
};
