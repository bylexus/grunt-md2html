/*
 * grunt-md2html - Small Grunt MultiTask to convert Markdown files to HTML, supporting Grunt >= 0.4.0
 * https://github.com/bylexus/grunt-md2html
 *
 * Copyright (c) 2013 Alexander Schenkel
 * Licensed under the MIT license.
 */

'use strict';

module.exports = function(grunt) {

  // Please see the Grunt documentation for more information regarding task
  // creation: http://gruntjs.com/creating-tasks

  grunt.registerMultiTask('md2html', 'Small Grunt MultiTask to convert Markdown files to HTML, supporting Grunt >= 0.4.0', function() {
    // Merge task-specific and/or target-specific options with these defaults.
    var options = this.options({
      separator: '\n\n',
      basePath: null,
      layout: null,
      markedOptions:{}
    });

    var marked = require("marked");
    marked.setOptions(options.markedOptions);
    var html;
    var layoutFile = options.layout;
    var layout = null;

    var path = require('path');
    if (layoutFile && grunt.file.exists(layoutFile)) {
      grunt.log.writeln('Using layout file: ' + layoutFile);
      layout = grunt.file.read(layoutFile);
    }


    // Iterate over all specified file groups.
    var me = this;
    this.files.forEach(function(f) {
      // Concat specified files.
      var src = f.src.filter(function(filepath) {
        // Warn on and remove invalid source files (if nonull was set).
        if (!grunt.file.exists(filepath)) {
          grunt.log.warn('Source file "' + filepath + '" not found.');
          return false;
        } else {
          return true;
        }
      }).map(function(filepath) {
        // Read file source.
        return grunt.file.read(filepath);
      }).join(grunt.util.normalizelf(options.separator));

      // Handle options.
      // src already contains the string containint the whole src content
      html = marked(src);

      // Check if we have to wrap a layout:
      if (!layout) {
        layout = '{DOC}';
      }

      var relPath = path.relative(path.dirname(f.dest), options.basePath || f.orig.dest);
      if (relPath.length === 0) {
        relPath = '.';
      }
      html = layout.replace(/\{DOC\}/g, html);
      html = html.replace(/\{BASEPATH\}/g, relPath);
      html = html.replace(/\{DEST\}/g, f.dest);

      // Write the destination file.
      grunt.file.write(f.dest, html);

      // Print a success message.
      grunt.log.writeln('File "' + f.dest + '" created.');
    });
  });

};