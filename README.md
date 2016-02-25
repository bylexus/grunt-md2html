[![Build Status](https://travis-ci.org/bylexus/grunt-md2html.svg?branch=master)](https://travis-ci.org/bylexus/grunt-md2html)

# grunt-md2html

Small Grunt MultiTask based on the nodejs package [marked](https://github.com/chjj/marked) to convert Markdown files to HTML, supporting Grunt >= 0.4.0

* Takes input Markdown-Files
* process them using the grunt-internal template engine (lodash)
* converts them to HTML either one-by-one or many-to-one
* optionally highlight code parts using highligh.js with optional style string

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


#### options.highlightjs
Type: `Object`
Default value:
```
options.highlightjs: {
    enabled: false,      // disabled by default
    style: 'monokai',    // highlightjs default theme (theme file name without .css)
    compressStyle: true, // minified version of the string based style sheet
    options: {}          // options for the highlightjs constructor
}
```

md2html includes [highlightjs](https://highlightjs.org/) if you want to highlight source code in the markdown file.
Code blocks then are enriched by highlightjs with HTML and style elements: The HTML is parsed and code blocks are sent through highlightjs before writing the final HTML.

Enable code highlighting / highlightjs tags by setting `enabled` to true.

To style the enriched code blocks, you have to include an official highlightjs CSS file:

You have two options for adding highlightjs styling / theming:

1. Include a highlightjs CSS file in your layout manually (see example [here](https://highlightjs.org/download/) )
2. Use the stringified CSS version in your template: grunt-md2html reads the original highlightjs
   style sheet as CSS string, and allows you to use it directly in your markdown file by outputting
   the template variable `highlightjs_style`:
```
<style>
  <%= highlightjs_style %>
</style>
```

An example:

```html
<!-- layout HTML file -->
<!DOCTYPE html>
<html>
    <head>
        <style>
          <%= highlightjs_style %>
        </style>
    </head>
    <body>
        <%= document %>
    </body>
</html>
```

<pre><code>
Markdown file with code snippet:
=================================
Now follows some javascript code:

```
var f = function(var1) {
    console.log(var1);
}
```
</code></pre>


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


#### Template example, including highlighjs

This example demonstrates the usage of the pre-processing Template engine which can be used
to process arbitary javascript variable / functions. It also demonstrates code
highlighting using highlightjs:

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
          highlightjs: {
            enabled: true,
            style: 'paraiso.dark',
            compressStyle: true
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
<style type="text/css"><%= highlightjs_style %></style>

Hello. This is an example written by <%= author %>.
It comes from the file <%= basename(src) %>, and ends in the file <%= destination %>.
Created on <%= grunt.template.today('yyyy-mm-dd HH:MM:ss') %>.

And now some highlighted code:

<pre><code>
    var fact = function(f) {
        if (f > 1) {
            return f * (fact(f-1));
        } else return 1;
    }
</code></pre>
```



## Release History

* 0.1.1: Changed Markdown parser: node-markdown replaced by marked
* 0.1.1: Changed Markdown parser: node-markdown replaced by marked
* 0.1.0: Very first release, no testing yet
* 0.1.5: Fixed: '$&' in html causes the tool to crash
* 0.1.6: Updated 'marked' dependency: now uses marked 0.2.10 as dependant version
* 0.1.7: Updated 'marked' dependency: now uses marked 0.3.2
* 0.2.0: Process MD files with the grunt-internal Template engine (lodash) first.
         Keeping backwards-compatibility.
* 0.2.1: Fixing Relative Path bug: introduced in 0.2.0, the basepath was no longer relative to the options.basePath set in config in scenarios using more than one directory level.
* 0.2.2: Updated dev environment and added unit tests
* 0.3.0: highlightjs support
* 0.3.1:
  * changed dependencies to support grunt 1.x
  * updated highlightjs related documentation

## License

(c) 2013-2016 Alexander Schenkel
Licensed under the MIT License
