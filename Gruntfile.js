/*
 * grunt-md2html
 * https://github.com/bylexus/grunt-md2html
 *
 * Copyright (c) 2013 Alexander Schenkel
 * Licensed under the MIT license.
 */

'use strict';

module.exports = function(grunt) {

  // Project configuration.
  grunt.initConfig({
    jshint: {
      all: [
        'Gruntfile.js',
        'tasks/*.js',
        '<%= nodeunit.tests %>',
      ],
      options: {
        jshintrc: '.jshintrc',
      },
    },

    // Before generating any new files, remove any previously-created files.
    clean: {
      tests: ['tmp'],
    },

    // Configuration to be run (and then tested).
    md2html: {
      multiple_files: {
        options: {
          layout: 'test/fixtures/layout.html',
          basePath: 'test/fixtures'
        },
        files: [{
          expand: true,
          cwd: 'test/fixtures/multiple_files',
          src: ['**/*.md'],
          dest: 'tmp/multiple_files',
          ext: '.html'
        }]
      },
      one_file: {
        options: {
          separator: '\n\n'
        },
        files: [{
          src: ['test/fixtures/one_file/**/*.md'],
          dest: 'tmp/one_file/output.html'
        }]
      }
    },



    // Unit tests.
    nodeunit: {
      tests: ['test/*_test.js'],
    }

  });

  // Actually load this plugin's task(s).
  grunt.loadTasks('tasks');

  // These plugins provide necessary tasks.
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-contrib-nodeunit');

  // Whenever the "test" task is run, first clean the "tmp" dir, then run this
  // plugin's task(s), then test the result.
  grunt.registerTask('test', ['clean', 'md2html', 'nodeunit']);

  // By default, lint and run all tests.
  grunt.registerTask('default', ['jshint', 'test']);

};
