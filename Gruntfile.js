/*
 * grunt-md2html
 * https://github.com/bylexus/grunt-md2html
 *
 * Copyright (c) 2013 Alexander Schenkel
 * Licensed under the MIT license.
 */

module.exports = function (grunt) {
    var path = require('path');

    // Project configuration.
    grunt.initConfig({
        // Before generating any new files, remove any previously-created files.
        clean: {
            tests: ['tmp']
        },

        // Configuration to be run (and then tested).
        md2html: {
            multiple_files: {
                options: {
                    layout: 'spec/fixtures/layout.html',
                    basePath: 'spec/fixtures',
                    markedOptions: { gfm: true }
                },
                files: [
                    {
                        expand: true,
                        cwd: 'spec/fixtures/multiple_files',
                        src: ['**/*.md'],
                        dest: 'tmp/multiple_files',
                        ext: '.html'
                    }
                ]
            },

            include: {
                options: {
                    basePath: 'spec/fixtures/includes',
                    markedOptions: { gfm: true }
                },
                files: [
                    {
                        expand: true,
                        cwd: 'spec/fixtures/includes',
                        src: ['**/*.md'],
                        filter: function (src) {
                            if (path.basename(src)[0] === '_') {
                                return false;
                            } else {
                                return true;
                            }
                        },
                        dest: 'tmp/includes',
                        ext: '.html'
                    }
                ]
            },

            one_file: {
                options: {
                    separator: '\n\n'
                },
                files: [
                    {
                        src: ['spec/fixtures/one_file/**/*.md'],
                        dest: 'tmp/one_file/output.html'
                    }
                ]
            },

            highlight: {
                options: {
                    highlightjs: {
                        enabled: true,
                        compressStyle: true,
                        style: 'paraiso-dark'
                    }
                },
                files: [
                    {
                        src: ['spec/fixtures/highlight/**/*.md'],
                        dest: 'tmp/highlight/output_compressed.html'
                    }
                ]
            },

            highlight_noncompressed: {
                options: {
                    highlightjs: {
                        enabled: true,
                        compressStyle: false,
                        style: 'paraiso-dark'
                    }
                },
                files: [
                    {
                        src: ['spec/fixtures/highlight/**/*.md'],
                        dest: 'tmp/highlight/output.html'
                    }
                ]
            },

            underscoreTemplating: {
                options: {
                    layout: 'spec/fixtures/underscoreLayout.html',
                    basePath: 'spec/fixtures',
                    markedOptions: { gfm: true },
                    templateData: {
                        basename: function (src) {
                            return src.substr(src.lastIndexOf(path.sep) + 1);
                        }
                    }
                },
                files: [
                    {
                        src: ['spec/fixtures/underscore_test/**/*.md'],
                        dest: 'tmp/underscore_test/output.html'
                    }
                ]
            },
            plantuml_local: {
                options: {
                    plantuml: {
                        exec: 'plantuml'
                    }
                },
                files: [
                    {
                        src: ['spec/fixtures/plantuml/output.md'],
                        dest: 'tmp/plantuml/output.html'
                    }
                ]
            },
            plantuml_server: {
                options: {
                    plantuml: {
                        renderServerUrl: 'http://www.plantuml.com/plantuml'
                    }
                },
                files: [
                    {
                        src: ['spec/fixtures/plantuml/output-server.md'],
                        dest: 'tmp/plantuml/output-server.html'
                    }
                ]
            }
        }
    });

    // Actually load this plugin's task(s).
    grunt.loadTasks('tasks');

    // These plugins provide necessary tasks.
    grunt.loadNpmTasks('grunt-contrib-clean');

    grunt.registerTask('default', ['clean', 'md2html']);
};
