Testing grunt-md2html with multiple file outputs
=================================================

The output should be split in multiple HTML files, one file per input file.

file: {DEST}
Base: <%= basepath %>

Some GFM:

```js
function() {
    console.log('this is some java script code');
}
```
