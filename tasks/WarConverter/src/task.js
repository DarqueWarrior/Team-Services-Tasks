/*
 * The purpose of this task is to run.
 */
var path = require('path');
var util = require('./utility.js');

/*
 * The entry point for the task. 
 */
function run(warFilePath, cwd, baseDir) {
    'use strict';

    util.debug('Entering War Converter task');
    
    // Find the warfile
    util.debug('warfile = findFiles({0})', warFilePath);
    var warfile = util.findFiles(warFilePath, baseDir)[0];
    util.debug('warfile: {0}', warfile);
    
    var outputPath = warfile.replace('.war', '.zip');
    util.debug('outputPath: {0}', outputPath);
    
    util.debug('cwd: {0}', cwd);
    
    var dest = path.join(cwd, '/webapps/ROOT');
    util.debug('dest: {0}', dest);
    
    var folderToZip = path.join(cwd, '/webapps');
    util.debug('folderToZip: {0}', folderToZip);

    util.unzipFile(warfile, dest, function () {
        util.zipFile(outputPath, folderToZip);
    });
}

/*
 * Exports the portions of the file we want to share with files that require 
 * it.
 */
module.exports = {
    run: run
};