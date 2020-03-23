/**
 * grunt-md2html - Helper functions
 * https://github.com/bylexus/grunt-md2html
 *
 * Copyright (c) 2013-2020 Alexander Schenkel
 * Licensed under the MIT license.
 */

"use strict";

var path = require("path");

/**
 * Helper function for PlantUML local image generation:
 * gets the source html and executes a locally installed plantuml
 * instance, generating the images in the destination folder.
 * @param {String} src The source content (md, html), containing plantuml blocks
 * @param {String} destFile The path to the final html file
 * @param {Object} plantumlOptions task options related to PlantUML (need: exec, imageFormat)
 * @param {Array} blocks Array of block objects
 * @param {grunt} grunt The grunt instance
 */
function generatePlantUmlImagesLocally(
  src,
  destFile,
  plantumlOptions,
  blocks,
  grunt
) {
  return new Promise(function(resolve, reject) {
    var exec = require("child_process").execSync;
    var tmpFile = destFile + ".plantuml.tmp";

    grunt.log.writeln("Found PlantUML in source, processing ...");

    // Write content to a temporary file, to be processed by PlantUML:
    grunt.file.write(tmpFile, src);

    var code = exec(
      plantumlOptions.exec + " -t" + plantumlOptions.imageFormat + " " + tmpFile
    );
    if (code > 0) {
      grunt.fail.fatal("Error while processing PlantUML in " + destFile);
    }
    grunt.file.delete(tmpFile);
    resolve();
  });
}

/**
 * Helper function for PlantUML remote server rendering:
 * gets the source html and the extracted plantuml blocks
 * and sends them to a PlantUML server to be rendered,
 * storing the created images in the destination folder.
 *
 * @param {String} src The source content (md, html), containing plantuml blocks
 * @param {String} destFile The path to the final html file
 * @param {Object} plantumlOptions task options related to PlantUML (need: exec, imageFormat)
 * @param {Array} blocks Array of block objects
 * @param {grunt} grunt The grunt instance
 */
function generatePlantUmlImagesRemote(
  src,
  destFile,
  plantumlOptions,
  blocks,
  grunt
) {
  return new Promise(function(resolve, reject) {
    var promises = [];
    blocks.forEach(function(block) {
      var encodedStr = plantumlCompress(block.innerUml);
      var url =
        plantumlOptions.renderServerUrl +
        "/" +
        plantumlOptions.imageFormat +
        "/" +
        encodedStr;
      grunt.log.writeln(
        "Sending PlantUML Block '" + block.title + "' to " + url
      );
      promises.push(getFromUrl(url));
    });
    Promise.all(promises)
      .then(function(responses) {
        responses.forEach(function(response, i) {
          var block = blocks[i];
          var imgFile =
            path.dirname(destFile) +
            "/" +
            block.title +
            "." +
            plantumlOptions.imageFormat;
          grunt.file.write(imgFile, response);
        });
        resolve();
      })
      .catch(reject);
  });
}

/**
 * Processes PlantUML blocks if available, and creates the images / replacement links.
 * Looks for a 'plantuml' config in the task options.
 *
 * @param {String} src The source content (md, html), containing plantuml blocks
 * @param {String} destFile The path to the final html file
 * @param {Object} options task options, including plantuml options, if available
 * @param {grunt} grunt The grunt instance
 */
function extractPlantUMLContent(src, destFile, options, grunt) {
  return new Promise(function(resolve, reject) {
    var plantumlOptions = options.plantuml || {};
    plantumlOptions = {
      exec: plantumlOptions.exec || null,
      renderServerUrl: plantumlOptions.renderServerUrl || null,
      imageFormat: plantumlOptions.imageFormat || "png"
    };

    // No PlantUML config? leave here:
    if (!options.plantuml) {
      resolve(src);
      return;
    }

    if (!plantumlOptions.exec && !plantumlOptions.renderServerUrl) {
      grunt.fail.fatal(
        'PlantUML: No "exec" or "renderServerUrl" in config. Abort.'
      );
    }

    // We match @startuml [title] ... @enduml blocks:
    var matches = src.match(/@startuml\s+([^\n\r]+)(.*?)@enduml\b/gms);
    var plantumlBlocks = matches.map(function(match) {
      var plantumlInfo = match.match(
        /@startuml\s+([^\n\r]+)[\r\n]+(.*?)@enduml\b/s
      );
      var title = plantumlInfo[1];
      var replaceRe = new RegExp(
        "@startuml\\s+" + title + "[\\r\\n]+.*?@enduml\\b",
        "s"
      );
      return {
        block: plantumlInfo[0],
        innerUml: plantumlInfo[2].trim(),
        title: title,
        replaceRegex: replaceRe
      };
    });

    if (matches.length > 0) {
      var promise = null;
      if (plantumlOptions.exec) {
        promise = generatePlantUmlImagesLocally(
          src,
          destFile,
          plantumlOptions,
          plantumlBlocks,
          grunt
        );
      } else if (plantumlOptions.renderServerUrl) {
        promise = generatePlantUmlImagesRemote(
          src,
          destFile,
          plantumlOptions,
          plantumlBlocks,
          grunt
        );
      }
      promise
        .then(function(res) {
          plantumlBlocks.forEach(function(block) {
            grunt.log.writeln("Found PlantUML Block: " + block.title);
            // Form replacement regex: match @startuml [title] to replace the
            // correct block, replace it by a md image:
            src = src.replace(
              block.replaceRegex,
              "![" +
                block.title +
                "](./" +
                block.title +
                "." +
                plantumlOptions.imageFormat +
                ")"
            );
          });
          resolve(src);
        })
        .catch(reject);
    } else {
      resolve(src);
    }
  });
}

function getFromUrl(url) {
  var fetch = require("node-fetch");
  return fetch(url).then(function(res) {
    return res.buffer();
  });
}

/**
 * Encodes a data string in PlantUML-base64. Taken from
 * https://plantuml.com/de/text-encoding
 * @param {String} data
 */
function encode64(data) {
  var r = "";
  for (var i = 0; i < data.length; i += 3) {
    if (i + 2 == data.length) {
      r += append3bytes(data.charCodeAt(i), data.charCodeAt(i + 1), 0);
    } else if (i + 1 == data.length) {
      r += append3bytes(data.charCodeAt(i), 0, 0);
    } else {
      r += append3bytes(
        data.charCodeAt(i),
        data.charCodeAt(i + 1),
        data.charCodeAt(i + 2)
      );
    }
  }
  return r;
}

/**
 * Helper function for encoding PlantUML to string. Taken from
 * https://plantuml.com/de/text-encoding
 */
function append3bytes(b1, b2, b3) {
  var c1 = b1 >> 2;
  var c2 = ((b1 & 0x3) << 4) | (b2 >> 4);
  var c3 = ((b2 & 0xf) << 2) | (b3 >> 6);
  var c4 = b3 & 0x3f;
  var r = "";
  r += encode6bit(c1 & 0x3f);
  r += encode6bit(c2 & 0x3f);
  r += encode6bit(c3 & 0x3f);
  r += encode6bit(c4 & 0x3f);
  return r;
}

/**
 * Helper function for encoding PlantUML to string. Taken from
 * https://plantuml.com/de/text-encoding
 */
function encode6bit(b) {
  if (b < 10) {
    return String.fromCharCode(48 + b);
  }
  b -= 10;
  if (b < 26) {
    return String.fromCharCode(65 + b);
  }
  b -= 26;
  if (b < 26) {
    return String.fromCharCode(97 + b);
  }
  b -= 26;
  if (b == 0) {
    return "-";
  }
  if (b == 1) {
    return "_";
  }
  return "?";
}

/**
 * Encodes a PlantUML string to the encoded form, to be used
 * in URLs directly. Taken from https://plantuml.com/de/text-encoding
 *
 * Create an encoded string from the block: The procedure is as follows:
 * (see https://plantuml.com/text-encoding):
 * 1. Encoded in UTF-8
 * 2. Compressed using Deflate algorithm
 * 3. Reencoded in ASCII using a transformation close to base64
 *
 * @param {String} s The PlantUML string, without @startuml/@enduml tags
 */
function plantumlCompress(s) {
  var zlib = require("zlib");
  // UTF8
  var data = unescape(encodeURIComponent(s));
  // Deflating:
  var deflated = zlib.deflateSync(data, { level: 9 });
  // encoding:
  var urlStr = encode64(deflated.toString("binary"));
  return urlStr;
}

module.exports = {
  extractPlantUMLContent: extractPlantUMLContent
};
