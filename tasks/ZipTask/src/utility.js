/*
 * This file contains many common functions for use creating Visual Studio Team
 * Service tasks in Node.js.
 */

var fs = require('fs');
var os = require('os');
var path = require('path');
var yazl = require('yazl');
var unzip = require('unzip2');
var tl = require('vso-task-lib');

function unzipFile(file, dir, callback) {
   var stream = fs.createReadStream(file).pipe(unzip.Extract({ path: dir }));
   stream.on('close', callback);
}

function zipFile(file, dir) {
   debug('starting zipFile {0}', dir);

   var allFiles = tl.find(dir);
   var zipFile = new yazl.ZipFile();
   
   // because Windows...
   dir = dir.replace(/\\/g, '/');

   allFiles.forEach(function (element, index, array) {
      var stats = fs.statSync(element);
      if (stats.isFile()) {
         // We want to start the zip at the root. The replace makes
         // sure any leading folders are removed.
         var location = element.replace(dir + "/", '');

         debug('adding {0} at {1}', element, location);
         
         zipFile.addFile(element, location);
      }
   });

   debug('Zipping files');
   zipFile.outputStream.pipe(fs.createWriteStream(file)).on("close", function () {
      debug("Zip created.");
   });

   zipFile.end();
}

/*
 * Returns and array of files that match the path passed in.  The path passed
 * in can be in mini match format.
 */
function findFiles(path, baseDir) {
   'use strict';

   var matchingFiles = [path];
    
   // If they don't provide a base dir just use the current folder
   baseDir = baseDir || '.';

   debug('baseDir: {0}', baseDir);

   if (path.indexOf('*') >= 0 || path.indexOf('?') >= 0) {
      debug('Searching for file using {0}', path);
      var allFiles = tl.find(baseDir);
      matchingFiles = tl.match(allFiles, path, { matchBase: true });
   }

   if (!matchingFiles) {
      tl.warning('No files found.');
      return null;
   }

   return matchingFiles;
}

/*
 * Deletes a folder recursively
 */
function rmdir(folder) {
   'use strict';

   // Check that the folder exists. If it does not just return.
   if (fs.existsSync(folder)) {
        
      // Get a list of all the files and directory names in this folder.
      fs.readdirSync(folder).forEach(function (file, index) {
            
         // Join the file/folder name with the base folder.
         var curPath = path.join(folder, file);
            
         // Determine if we are working with a directory or a file.
         if (fs.lstatSync(curPath).isDirectory()) {
            // If it is a directory simply call this function again
            // to walk all files and folders.
            rmdir(curPath);
         } else {
            // Once you reach a file delete it.
            fs.unlinkSync(curPath);
         }
      });
        
      // Now we can delete the folder now that it is empty.
      fs.rmdirSync(folder);
   }
}

/*
 * Allows you to use C# syntax for string format i.e. 
 * String.format('{0} {1}', var1, var2);
 */
String.format = function () {
   'use strict';

   return format(arguments);
};

/*
 * Private format function to support C# string.Format syntax
 */
function format(args) {
   'use strict';

   var s = args[0];
   for (var i = 0; i < args.length - 1; i++) {
      var reg = new RegExp('\\{' + i + '\\}', 'gm');
      s = s.replace(reg, args[i + 1]);
   }

   return s;
}

/*
 * Allows you to use C# string.Format syntax to write debug messages.
 */
function debug() {
   'use strict';

   tl.debug(format(arguments));
}

/*
 * Exports the portions of the file we want to share with files that require 
 * it.
 */
module.exports = {
   rmdir: rmdir,
   debug: debug,
   findFiles: findFiles,
   unzipFile: unzipFile,
   zipFile: zipFile
};