# grunt-md2html

> Small Grunt MultiTask to convert Markdown files to HTML, supporting Grunt >= 0.4.0

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
```html
<!DOCTYPE html>
<html>
    <head>
        <link rel="stylesheet" type="text/css" href="{BASEPATH}style.css">
        <title></title>
    </head>
    <body>
        {DOC}
    </body>
</html>
```
This layout file adds an HTML skeleton around each processed output file, replacing BASEPATH
and DOC (the processed content).


#### options.basePath
Type: `String`
Default value: `null`

If basePath is set, you can use `'{BASEPATH}'` in your .md / layout file, which is expanded
to a relative path from the actual output file to the given basePath. Useful to link
static resources like stylesheets in the layout file

#### options.separator
Type: `String`
Default value: `'\n\n'`

A string value that is used to concatenate the .md files if used in one-outputfile mode

### Replacements

The following strings are replaced during the md-to-html process:

* `{DOC}`: Contains the processed HTML code for a destination file. Useful for a Layout file.
* `{BASEPATH}`: Points relatively to the `dest` path of the actual output, or to the given basePath in the options.
* `{DEST}`: The relative path to the actual destination file.


### Usage Examples

#### Single HTML file output
In this example, all found .md files are converted to HTML and ONE html output file is generated:


```js
grunt.initConfig({
  md2html: {
      one_file: {
        options: {
        },
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
})
```

#### Options example
This example just demonstrates the different options:

* layout: A layout file used for each processed output file
* basePath: The `'{BASEPATH}'` variable which can be used within the docs points relatively to the basePath
* separator: concatenator string when using multiple md files which go to one output file


```js
grunt.initConfig({
  md2html: {
      multiple_files: {
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
})
```


## Release History

* 0.1.0: Very first release, no testing yet
