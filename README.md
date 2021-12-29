![Build Status](https://github.com/bylexus/grunt-md2html/workflows/grunt-md2html%20tests/badge.svg?branch=master)

# grunt-md2html

Small Grunt MultiTask based on the nodejs package [marked](https://github.com/chjj/marked) to convert Markdown files to HTML.

**Note:** Since version 0.6.0, this Grunt MultiTask needs `nodejs >= 12` and `grunt >= 1.0.0`.

* Takes input Markdown-Files
* process them using the grunt-internal template engine (lodash)
* converts them to HTML either one-by-one or many-to-one
* optionally highlight code parts using highligh.js with optional style string
* Supports embedded [ PlantUML ](https://plantuml.com/) to directly render images from PlantUML Code

## Table of Contents
- [Table of Contents](#table-of-contents)
- [Getting Started](#getting-started)
- [The "md2html" task](#the-md2html-task)
  - [Overview](#overview)
  - [Options](#options)
    - [options.layout](#optionslayout)
    - [options.basePath](#optionsbasepath)
    - [options.markedOptions](#optionsmarkedoptions)
    - [options.templateData](#optionstemplatedata)
    - [options.separator](#optionsseparator)
  - [Template variables](#template-variables)
    - [options.highlightjs](#optionshighlightjs)
    - [options.plantuml](#optionsplantuml)
  - [Usage Examples](#usage-examples)
    - [Single HTML file output](#single-html-file-output)
    - [One HTML file per md file output](#one-html-file-per-md-file-output)
    - [Options example](#options-example)
    - [Template example, including highlighjs](#template-example-including-highlighjs)
      - [grunt config](#grunt-config)
      - [Template .md file](#template-md-file)
    - [Include other .md files from within .md](#include-other-md-files-from-within-md)
      - [Example: The main file with a TOC](#example-the-main-file-with-a-toc)
      - [The separate TOC file](#the-separate-toc-file)
      - [Use '_' in your included file names to filter them from output creation](#use-_-in-your-included-file-names-to-filter-them-from-output-creation)
    - [PlantUML example](#plantuml-example)
- [Release History](#release-history)
- [License](#license)

## Getting Started
This plugin requires Grunt `^1.0.0`

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

* `document`: Contains the processed HTML code for a destination file. Useful for a Layout file. (For backward compatibility: use `{DOC}`).<br />
  **Note:** `document` is ONLY available in a layout file, not in a single source .md file.
* `basepath`: Points relatively to the `dest` path of the actual output, or to the given basePath in the options. (For backward compatibility: use `{BASEPATH}`)
* `destination`: The relative path to the actual destination file. (For backward compatibility: use `{DEST}`)
* `src`: The original .md source file in which the variable occurs. **NOTE:** In a layout template file (see below), this variable is an array: The grunt job can concat multiple files into one destination file.

`src` needs to be treatened differently for source files and layout files:

* in a source .md file, `src` is the path (string) to the original .md file
* in a layout template file, `src` is an array: A grunt job can concat multiple files into
  one destination, in a grunt files config like this:
```js
// Gruntfile.js
module.exports = function (grunt) {
    grunt.initConfig({
        md2html: {
            'multifiles': {
                options: {
                    layout: 'layout.html',
                },
                files: [
                    {
                        // multiple file to 1 dest:
                        src: ['multi_1.md', 'multi_2.md'],
                        dest: 'output.html'
                    }
                ]
            }
        }
    });
};
```

So make sure to use `src` appropriately:

```
// multi_1.md:
Source file: <%= src %>
```

```
// layout.html:
Source files:
<% src.forEach(function(f){ %>
- <%= f %>
<% }) %>
```


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

1. Include a highlightjs CSS file in your layout manually (see example [here](https://highlightjs.org/download/) ). If you use this method then don't add highlightjs to your options in the gruntfile or it will run twice.
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

#### options.plantuml
* Type: `Object`
* Default value: null
* Available configs:
```
options.plantuml: {
     // Local run:
     // Full execution command of PlantUML, without options:
    exec: 'java -jar plantuml.jar'
    // Remote run:
    // Provide the base URL for the PlantUML Render Servlet:
    renderServerUrl: "http://www.plantuml.com/plantuml"
}
```

Either **exec** or **renderServerUrl** is needed:

* If you have a local plantuml binary / JAR file, provide the full execution command in the `exec`property.
  The command is appended with PlantUML options, e.g. `java -jar plantuml.jar -tpng inputfile.html`
* If you want to use a remote PlantUML render server (see https://plantuml.com/server), provide the base URL for the render service
  with the `renderServerUrl` property. The diagram code is URL-encoded and appended to the URL, for example:
  http://www.plantuml.com/plantuml/png/UDehoIp9ILNmhLG8o4dCAmdrzL5moKnCBqhCvKhEIImkLaZBprUevb80WgJ48Yk5u9AYpBnqhbe031uI8G00`

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

#### Include other .md files from within .md

You can also include (load) other .md files within your .md files. This makes the generation of a separate TOC file, which is included in each output file, very easy:

##### Example: The main file with a TOC

Note that the file path must be relative to your Gruntfile:

```
An MD file. Include the TOC here:
<% print(grunt.file.read('gruntfile/rel/path/to/md/file.md')) %>
```

##### The separate TOC file
```
Table of contents:

* foo
* bar
```

The output html then looks as follows:

```
An MD file. Include the TOC here:
Table of contents:

* foo
* bar
```

##### Use '_' in your included file names to filter them from output creation

If you don't want to have an output file generated for each included file, you can use a file name convention:

* Start each included filename with a '_'
* Use the `filter` property in the Gruntifle's `file` definition.

Example:
```javascript
grunt.initConfig({
    md2html: {
      includeTest: {
        files: [{
          expand: true,
          cwd: 'docs',
          src: ['**/*.md'],
          // Filter away all files that begin with '_':
          filter: function(src) {
            if (path.basename(src)[0] === '_') { return false; } else { return true; }
          },
          dest: 'output',
          ext: '.html'
        }]
      }
});
```

#### PlantUML example

You can directly embed [PlantUML](https://plantuml.com/) code into your markdown/html files:

```text
<!-- document.md: -->
Markdown with embedded PlantUML
-------------------------------

Here comes my Diagram:

@startuml name-of-image
class Foo {
}
class Bar {
}
Foo <|-- Bar
@enduml

... and another:

@startuml name-of-2nd-image
Bob -> Alice : hello
@enduml
```

It is important to define the imagename `@startuml [imgname]`: This will be used as the
image filename (plus ending).

The snippets are then parsed on build time, images are generated and replaced with their
respective image markdown tags:

```text
<!-- document.md: -->
Markdown with embedded PlantUML
-------------------------------

Here comes my Diagram:

![name-of-image](name-of-image.png)

... and another:

![name-of-2nd-image](name-of-2nd-image.png)
```

The Gruntfile must enable either local or remote PlantUML rendering settings:

```js
// Gruntfile.js:
grunt.initConfig({
  md2html: {
      some_diagrams: {
        options: {
            plantuml: {
                // Local plantuml executable:
                exec: '/usr/bin/plantuml',
                // ... or remote render server:
                renderServerUrl: "http://www.plantuml.com/plantuml"
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
* 0.4.0:
  * Adding embedded PlantUML support
  * Updating dependencies
* 0.4.1:
  * Fixing bug: if no PlantuML matches were found, but a plantuml config present, matches was null
  * minor textual changes
* 0.5.0:
  * Dropping legacy support:
    * NodeJS >= 8 is needed
    * Grunt >= 1.0.0 is needed
  * Fixing Regex `s` flag lack - replaced by `[\s\S]`
  * Fixing some nasty bugs introduced in 0.4.x
  * Updated linting and testing framework
* 0.5.1: Bugfix: basepath variable not evaluated correctly on multiple files
* 0.6.0: 
  * Updated dependencies: we use now marked 4 and highlightjs 11.
  * nodejs >= 12.0 is now required
* 0.6.1:
  * Bugfix (Issue #23): `src` variable was not available in layout templates.

## License

(c) 2013-2021 Alexander Schenkel
Licensed under the MIT License
