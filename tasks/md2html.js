/**
 * grunt-md2html - Small Grunt MultiTask to convert Markdown files to HTML, supporting Grunt >= 0.4.0
 * https://github.com/bylexus/grunt-md2html
 *
 * Copyright (c) 2013 Alexander Schenkel
 * Licensed under the MIT license.
 */

'use strict';

module.exports = function(grunt) {

  grunt.registerMultiTask('md2html', 'Small Grunt MultiTask to convert Markdown files to HTML, supporting Grunt >= 0.4.0', function() {
    // Merge task-specific and/or target-specific options with these defaults.
    var options = this.options({
      separator: '\n\n',
      basePath: null,
      layout: null,
      markedOptions:{},
      templateData: {}
    });

    var marked = require("marked");
    var html;
    var layoutFile = options.layout;
    var layout = null;
    var path = require('path');

    marked.setOptions(options.markedOptions);

    if (layoutFile && grunt.file.exists(layoutFile)) {
      grunt.log.writeln('Using layout file: ' + layoutFile);
      layout = grunt.file.read(layoutFile);
    }


    // Iterate over all specified file groups.
    var me = this;
    this.files.forEach(function(f) {
      var relPath = path.relative(path.dirname(f.dest), options.basePath || f.orig.dest);
      if (relPath.length === 0) {
        relPath = '.';
      }
      var layoutHtml = layout;

      options.templateData.basepath = relPath;
      options.templateData.destination = f.dest;

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
        var content = grunt.file.read(filepath);
        options.templateData.src = filepath;
        return grunt.template.process(content,{data: options.templateData});
      }).join(grunt.util.normalizelf(options.separator));

      delete options.templateData.src;

      // Handle options.
      // src already contains the string containing the whole src content
      html = marked(src);

      // Check if we have to wrap a layout:
      if (!layoutHtml) {
        layoutHtml = '{DOC}';
      }

      options.templateData.document = html;
      layoutHtml = grunt.template.process(layoutHtml,{data: options.templateData});
      layoutHtml = layoutHtml.replace(/\{DOC\}/g, function() { return html; });
      layoutHtml = layoutHtml.replace(/\{BASEPATH\}/g, relPath);
      layoutHtml = layoutHtml.replace(/\{DEST\}/g, f.dest);

      // Write the destination file.
      grunt.file.write(f.dest, layoutHtml);

      // Print a success message.
      grunt.log.writeln('File "' + f.dest + '" created.');
    });
  });

};
