# grunt-md2html

Small Grunt MultiTask based on the nodejs package [marked](https://github.com/chjj/marked) to convert Markdown files to HTML, supporting Grunt >= 0.4.0

* Takes input Markdown-Files
* process them using the grunt-internal template engine (lodash)
* converts them to HTML either one-by-one or many-to-one

## Getting Started
This plugin requires Grunt `~0.4.0`

If you haven't used [Grunt](http://gruntjs.com/) before, be sure to check out the [Getting Started](http://gruntjs.com/getting-started) guide, as it explains how to create a [Gruntfile](http://gruntjs.com/sample-gruntfile) as well as install and use Grunt plugins. Once you're familiar with that process, you may install this plugin with this command:

```shell
npm install grunt-md2html --save-dev
```

One the plugin has been installed, it may be enabled inside your Gruntfile with this line of JavaScript:

```js
grunt.loadNpmTasks('grunt-md2html');
```

## The "md2html" task

### Overview
In your project's Gruntfile, add a section named `md2html` to the data object passed into `grunt.initConfig()`.

```js
grunt.initConfig({
  md2html: {
    options: {
      // Task-specific options go here.
    },
    your_target: {
      // Target-specific file lists and/or options go here.
    },
  },
})
```

### Options

#### options.layout
Type: `String`
Default value: `null`

A path to a layout file: A Layout file defines the global surrounding layout,
e.g. an HTML header / footer. Within the Layout file you can then include the
actual processed .md-file content.

Example layout file:
```
<!DOCTYPE html>
<html>
    <head>
        <link rel="stylesheet" type="text/css" href="<%= basepath %>/style.css">
        <title></title>
    </head>
    <body>
        <%= document %>
    </body>
</html>
```
This layout file adds an HTML skeleton around each processed output file, replacing the template
strings `basepath` and `document ` (the processed content).


#### options.basePath
Type: `String`
Default value: `null`

If basePath is set, you can use `<%= basepath %>` in your .md / layout file, which is expanded
to a relative path from the actual output file to the given basePath. Useful to link
static resources like stylesheets in the layout file

#### options.markedOptions
Type: `Object`
Default value: `{}`

Options to be set on the `marked` package, see https://github.com/chjj/marked for details. E.g.:

```
markedOptions: {
  gfm: false
}
```

disables the GIT flavored markdown.

#### options.templateData
Type: `Object`
Default value: `{}`

Additional data which is passed to the template engine before the .md file is processed.
The data object's content is directly available as template vars / functions. See Usage Examples
for more information.


#### options.separator
Type: `String`
Default value: `'\n\n'`

A string value that is used to concatenate the .md files if used in one-outputfile mode

### Template variables

Each markdown file is first processed by the Grunt-internal Template Engine (see http://gruntjs.com/api/grunt.template). In addition to the grunt-own template variables and functions, you can use the following
variables which are replaced BEFORE processing the MD file:

* `document`: Contains the processed HTML code for a destination file. Useful for a Layout file. (For backward compatibility: use `{DOC}`)
* `basepath`: Points relatively to the `dest` path of the actual output, or to the given basePath in the options. (For backward compatibility: use `{BASEPATH}`)
* `destination`: The relative path to the actual destination file. (For backward compatibility: use `{DEST}`)
* `src`: The original .md source file in which the variable occurs

### Usage Examples

#### Single HTML file output
In this example, all found .md files are converted to HTML and ONE html output file is generated:


```js
grunt.initConfig({
  md2html: {
      one_file: {
        options: {},
        files: [{
          src: ['my/md/files/**/*.md'],
          dest: 'out/output.html'
        }]
      }
    }
})
```

#### One HTML file per md file output
In this example, all found .md files are converted to an HTML file in the same directory.
Note that this is a base functionality of grunt's file expanding facility:


```js
grunt.initConfig({
  md2html: {
      multiple_files: {
        options: {},
        files: [{
          expand: true,
          cwd: 'base/path/to/md/files',
          src: ['**/*.md'],
          dest: 'output',
          ext: '.html'
        }]
      }
    }
});
```

#### Options example
This example just demonstrates the different options:

* layout: A layout file used for each processed output file
* basePath: The `<%= basepath %>` template variable which can be used within the docs points relatively to the basePath
* separator: concatenator string when using multiple md files which go to one output file


```js
grunt.initConfig({
  md2html: {
      multiple_files: {
        options: {
          layout: 'path/to/layout.html',
          basePath: 'path/to',
          markedOptions: {
            gfm: false,
            langPrefix: 'code-'
          }
        },
        files: [{
          expand: true,
          cwd: 'base/path/to/md/files',
          src: ['**/*.md'],
          dest: 'output',
          ext: '.html'
        }]
      }
    }
});
```


#### Template example
This example demonstrates the usage of the pre-processing Template engine which can be used
to process arbitary javascript variable / functions:

##### grunt config
```js
grunt.initConfig({
  md2html: {
      multiple_files: {
        options: {
          basePath: 'path/to',
          // Provide the function `basename` and a variable `author` to the templates
          templateData: {
            basename: function(src) {
                return src.substr(src.lastIndexOf(path.sep)+1);
            },
            author: process.env.USER

          },
        },
        files: [{
          expand: true,
          cwd: 'base/path/to/md/files',
          src: ['**/*.md'],
          dest: 'output',
          ext: '.html'
        }]
      }
    }
});
```

##### Template .md file
```
Hello. This is an example written by <%= author %>.
It comes from the file <%= basename(src) %>, and ends in the file <%= destination %>.
Created on <%= grunt.template.today('yyyy-mm-dd HH:MM:ss') %>.
```




## Release History

* 0.1.1: Changed Markdown parser: node-markdown replaced by marked
* 0.1.0: Very first release, no testing yet
* 0.1.5: Fixed: '$&' in html causes the tool to crash
* 0.1.6: Updated 'marked' dependency: now uses marked 0.2.10 as dependant version
* 0.1.7: Updated 'marked' dependency: now uses marked 0.3.2
* 0.2.0: Process MD files with the grunt-internal Template engine (lodash) first.
         Keeping backwards-compatibility.
* 0.2.1: Fixing Relative Path bug: introduced in 0.2.0, the basepath was no longer relative to the options.basePath set in config in scenarios using more than one directory level.


## License

(c) 2013-2014 Alexander Schenkel
Licensed under the MIT License

