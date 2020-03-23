/*
 * grunt-md2html
 * https://github.com/bylexus/grunt-md2html
 *
 * Copyright (c) 2013 Alexander Schenkel
 * Licensed under the MIT license.
 */

"use strict";

module.exports = function(grunt) {
  var path = require("path");

  // Project configuration.
  grunt.initConfig({
    jshint: {
      all: ["Gruntfile.js", "tasks/*.js", "<%= nodeunit.tests %>"],
      options: {
        jshintrc: ".jshintrc"
      }
    },

    // Before generating any new files, remove any previously-created files.
    clean: {
      tests: ["tmp"]
    },

    // Configuration to be run (and then tested).
    md2html: {
      multiple_files: {
        options: {
          layout: "test/fixtures/layout.html",
          basePath: "test/fixtures",
          markedOptions: { gfm: true }
        },
        files: [
          {
            expand: true,
            cwd: "test/fixtures/multiple_files",
            src: ["**/*.md"],
            dest: "tmp/multiple_files",
            ext: ".html"
          }
        ]
      },

      include: {
        options: {
          basePath: "test/fixtures/includes",
          markedOptions: { gfm: true }
        },
        files: [
          {
            expand: true,
            cwd: "test/fixtures/includes",
            src: ["**/*.md"],
            filter: function(src) {
              if (path.basename(src)[0] === "_") {
                return false;
              } else {
                return true;
              }
            },
            dest: "tmp/includes",
            ext: ".html"
          }
        ]
      },

      one_file: {
        options: {
          separator: "\n\n"
        },
        files: [
          {
            src: ["test/fixtures/one_file/**/*.md"],
            dest: "tmp/one_file/output.html"
          }
        ]
      },

      highlight: {
        options: {
          highlightjs: {
            enabled: true,
            compressStyle: true,
            style: "paraiso-dark"
          }
        },
        files: [
          {
            src: ["test/fixtures/highlight/**/*.md"],
            dest: "tmp/highlight/output_compressed.html"
          }
        ]
      },

      highlight_noncompressed: {
        options: {
          highlightjs: {
            enabled: true,
            compressStyle: false,
            style: "paraiso-dark"
          }
        },
        files: [
          {
            src: ["test/fixtures/highlight/**/*.md"],
            dest: "tmp/highlight/output.html"
          }
        ]
      },

      underscoreTemplating: {
        options: {
          layout: "test/fixtures/underscoreLayout.html",
          basePath: "test/fixtures",
          markedOptions: { gfm: true },
          templateData: {
            basename: function(src) {
              return src.substr(src.lastIndexOf(path.sep) + 1);
            }
          }
        },
        files: [
          {
            src: ["test/fixtures/underscore_test/**/*.md"],
            dest: "tmp/underscore_test/output.html"
          }
        ]
      },
      plantuml_local: {
        options: {
          plantuml: {
            exec: "java -jar ~/bin/plantuml.jar"
          }
        },
        files: [
          {
            src: ["test/fixtures/plantuml/output.md"],
            dest: "tmp/plantuml/output.html"
          }
        ]
      },
      plantuml_server: {
        options: {
          plantuml: {
            renderServerUrl: "http://www.plantuml.com/plantuml"
          }
        },
        files: [
          {
            src: ["test/fixtures/plantuml/output-server.md"],
            dest: "tmp/plantuml/output-server.html"
          }
        ]
      },
    },

    // Unit tests.
    nodeunit: {
      tests: ["test/*_test.js"]
    }
  });

  // Actually load this plugin's task(s).
  grunt.loadTasks("tasks");

  // These plugins provide necessary tasks.
  grunt.loadNpmTasks("grunt-contrib-jshint");
  grunt.loadNpmTasks("grunt-contrib-clean");
  grunt.loadNpmTasks("grunt-contrib-nodeunit");

  // Whenever the "test" task is run, first clean the "tmp" dir, then run this
  // plugin's task(s), then test the result.
  grunt.registerTask("test", ["clean", "md2html", "nodeunit"]);

  // By default, lint and run all tests.
  grunt.registerTask("default", ["jshint", "test"]);
};
