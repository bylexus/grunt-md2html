/**
 * grunt-md2html - Helper functions
 * https://github.com/bylexus/grunt-md2html
 *
 * Copyright (c) 2013-2020 Alexander Schenkel
 * Licensed under the MIT license.
 */

const path = require('path');

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
function generatePlantUmlImagesLocally(src, destFile, plantumlOptions, blocks, grunt) {
    return new Promise((resolve, reject) => {
        const exec = require('child_process').execSync;
        const tmpFile = destFile + '.plantuml.tmp';

        grunt.log.writeln('Processing PlantUML blocks in ' + destFile);

        // Write content to a temporary file, to be processed by PlantUML:
        grunt.file.write(tmpFile, src);

        let code = exec(plantumlOptions.exec + ' -t' + plantumlOptions.imageFormat + ' ' + tmpFile);
        if (code > 0) {
            grunt.fail.fatal('Error while processing PlantUML in ' + destFile);
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
function generatePlantUmlImagesRemote(src, destFile, plantumlOptions, blocks, grunt) {
    return new Promise((resolve, reject) => {
        let promises = [];
        blocks.forEach((block) => {
            let encodedStr = plantumlCompress(block.innerUml);
            let url = plantumlOptions.renderServerUrl + '/' + plantumlOptions.imageFormat + '/' + encodedStr;
            grunt.log.writeln("Sending PlantUML Block '" + block.title + "' to " + url);
            promises.push(getFromUrl(url));
        });
        Promise.all(promises)
            .then((responses) => {
                responses.forEach((response, i) => {
                    let block = blocks[i];
                    let imgFile = path.dirname(destFile) + '/' + block.title + '.' + plantumlOptions.imageFormat;
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
    return new Promise((resolve, reject) => {
        let plantumlOptions = options.plantuml || {};
        plantumlOptions = {
            exec: plantumlOptions.exec || null,
            renderServerUrl: plantumlOptions.renderServerUrl || null,
            imageFormat: plantumlOptions.imageFormat || 'png'
        };

        // No PlantUML config? leave here:
        if (!options.plantuml) {
            resolve(src);
            return;
        }

        if (!plantumlOptions.exec && !plantumlOptions.renderServerUrl) {
            grunt.fail.fatal('PlantUML: No "exec" or "renderServerUrl" in config. Abort.');
        }

        // We match @startuml [title] ... @enduml blocks:
        let matches = src.match(/@startuml\s+([^\n\r]+)([\s\S]*?)@enduml\b/gm);
        matches = matches || [];
        let plantumlBlocks = matches.map((match) => {
            let plantumlInfo = match.match(/@startuml\s+([^\n\r]+)[\r\n]+([\s\S]*?)@enduml\b/);
            let title = plantumlInfo[1];
            let replaceRe = new RegExp('@startuml\\s+' + title + '[\\r\\n]+[\\s\\S]*?@enduml\\b');
            return {
                block: plantumlInfo[0],
                innerUml: plantumlInfo[2].trim(),
                title: title,
                replaceRegex: replaceRe
            };
        });

        if (matches.length > 0) {
            let promise = null;
            if (plantumlOptions.exec) {
                promise = generatePlantUmlImagesLocally(src, destFile, plantumlOptions, plantumlBlocks, grunt);
            } else if (plantumlOptions.renderServerUrl) {
                promise = generatePlantUmlImagesRemote(src, destFile, plantumlOptions, plantumlBlocks, grunt);
            }
            promise
                .then((res) => {
                    plantumlBlocks.forEach((block) => {
                        grunt.log.writeln(destFile + ': Replacing PlantUML Block: ' + block.title);
                        // Form replacement regex: match @startuml [title] to replace the
                        // correct block, replace it by a md image:
                        src = src.replace(
                            block.replaceRegex,
                            '![' + block.title + '](./' + block.title + '.' + plantumlOptions.imageFormat + ')'
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
    const fetch = require('node-fetch');
    return fetch(url).then((res) => res.buffer());
}

/**
 * Encodes a data string in PlantUML-base64. Taken from
 * https://plantuml.com/de/text-encoding
 * @param {String} data
 */
function encode64(data) {
    let r = '';
    for (let i = 0; i < data.length; i += 3) {
        if (i + 2 === data.length) {
            r += append3bytes(data.charCodeAt(i), data.charCodeAt(i + 1), 0);
        } else if (i + 1 === data.length) {
            r += append3bytes(data.charCodeAt(i), 0, 0);
        } else {
            r += append3bytes(data.charCodeAt(i), data.charCodeAt(i + 1), data.charCodeAt(i + 2));
        }
    }
    return r;
}

/**
 * Helper function for encoding PlantUML to string. Taken from
 * https://plantuml.com/de/text-encoding
 */
function append3bytes(b1, b2, b3) {
    let c1 = b1 >> 2;
    let c2 = ((b1 & 0x3) << 4) | (b2 >> 4);
    let c3 = ((b2 & 0xf) << 2) | (b3 >> 6);
    let c4 = b3 & 0x3f;
    let r = '';
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
    if (b === 0) {
        return '-';
    }
    if (b === 1) {
        return '_';
    }
    return '?';
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
    let zlib = require('zlib');
    // UTF8
    let data = unescape(encodeURIComponent(s));
    // Deflating:
    let deflated = zlib.deflateSync(data, { level: 9 });
    // encoding:
    let urlStr = encode64(deflated.toString('binary'));
    return urlStr;
}

module.exports = {
    extractPlantUMLContent: extractPlantUMLContent
};
