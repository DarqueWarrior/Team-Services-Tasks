/*
 * The purpose of this task is to run.
 */
var path = require('path');
var util = require('./utility.js');

/*
 * The entry point for the task. 
 */
function run(folderToZip, outputPath) {
    'use strict';
    
    util.debug('Entering Zip task');
    util.debug('zipping ' + outputPath + " to " + folderToZip);
    
    util.zipFile(outputPath, folderToZip);
}

/*
 * Exports the portions of the file we want to share with files that require 
 * it.
 */
module.exports = {
    run: run
};