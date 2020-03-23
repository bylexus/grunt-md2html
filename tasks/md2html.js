/**
 * grunt-md2html - Small Grunt MultiTask to convert Markdown files to HTML.
 * https://github.com/bylexus/grunt-md2html
 *
 * Copyright (c) 2013-2020 Alexander Schenkel
 * Licensed under the MIT license.
 */

module.exports = function (grunt) {
    const helpers = require('../lib/helpers.js');
    const marked = require('marked');
    const path = require('path');
    const hl = require('highlight.js');

    grunt.registerMultiTask('md2html', 'Small Grunt MultiTask to convert Markdown files to HTML', function () {
        // Merge task-specific and/or target-specific options with these defaults.
        let options = this.options({
            separator: '\n\n',
            basePath: null,
            layout: null,
            markedOptions: {},
            highlightjs: {
                enabled: false,
                style: 'monokai',
                compressStyle: true,
                options: {}
            },
            templateData: {}
        });

        let done = this.async();
        let html;
        let layoutFile = options.layout;
        let layout = null;

        // Enable and configure highlight.js, if required:
        if (options.highlightjs && options.highlightjs.enabled) {
            let stylePath = path.join(
                    path.dirname(require.resolve('highlight.js')),
                    '..',
                    'styles',
                    (options.highlightjs.style || 'monokai') + '.css'
                ),
                CleanCSS = require('clean-css');

            // load css style file and compress it, if required:
            // the style string is available in the template as highlightjs-style var:
            if (grunt.file.exists(stylePath)) {
                options.templateData.highlightjs_style = grunt.file.read(stylePath);

                if (options.highlightjs.compressStyle) {
                    options.templateData.highlightjs_style = new CleanCSS().minify(
                        options.templateData.highlightjs_style
                    ).styles;
                }
            }

            // enable marked's synced highlight callback to apply highlightjs:
            options.markedOptions.highlight = (code) => {
                hl.configure(options.highlightjs.options || {});
                return hl.highlightAuto(code).value;
            };
        }

        marked.setOptions(options.markedOptions);

        if (layoutFile && grunt.file.exists(layoutFile)) {
            grunt.log.writeln('Using layout file: ' + layoutFile);
            layout = grunt.file.read(layoutFile);
        }

        // Iterate over all specified file groups.
        let promises = [];
        this.files.forEach((f) => {
            let relPath = path.relative(path.dirname(f.dest), options.basePath || f.orig.dest);
            if (relPath.length === 0) {
                relPath = '.';
            }
            let layoutHtml = layout;

            options.templateData.basepath = relPath;
            options.templateData.destination = f.dest;

            // Concat specified files.
            let src = f.src
                .filter((filepath) => {
                    // Warn on and remove invalid source files (if nonull was set).
                    if (!grunt.file.exists(filepath)) {
                        grunt.log.warn('Source file "' + filepath + '" not found.');
                        return false;
                    } else {
                        return true;
                    }
                })
                .map((filepath) => {
                    // Read file source.
                    let content = grunt.file.read(filepath);
                    options.templateData.src = filepath;
                    return grunt.template.process(content, {
                        data: options.templateData
                    });
                })
                .join(grunt.util.normalizelf(options.separator));

            delete options.templateData.src;

            // PlantUML extraction: This is async, so
            // the rest of the task must wait:
            let promise = helpers.extractPlantUMLContent(src, f.dest, options, grunt).then((src) => {
                // Handle options.
                // src already contains the string containing the whole src content
                html = marked(src);

                // Check if we have to wrap a layout:
                if (!layoutHtml) {
                    layoutHtml = '{DOC}';
                }

                options.templateData.document = html;
                layoutHtml = grunt.template.process(layoutHtml, {
                    data: options.templateData
                });
                layoutHtml = layoutHtml.replace(/\{DOC\}/g, html);
                layoutHtml = layoutHtml.replace(/\{BASEPATH\}/g, relPath);
                layoutHtml = layoutHtml.replace(/\{DEST\}/g, f.dest);

                // Write the destination file.
                grunt.file.write(f.dest, layoutHtml);

                // Print a success message.
                grunt.log.writeln('File "' + f.dest + '" created.');
            });
            promises.push(promise);
        });
        Promise.all(promises).then(done).catch(done);
    });
};
