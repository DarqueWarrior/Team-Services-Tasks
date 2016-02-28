/*
 * The purpose of this file is to run from the command line.
 * This is great for integration testing without having to run
 * from a build.
 */

var cli = require('cli');
var task = require('./task.js');
var util = require('./utility.js');

cli.parse({
   cwd: ['c', 'Working directory', 'string', null],
   baseDir: ['b', 'Folder to search', 'string', null],
   warFilePath: ['w', 'Path to war file to use', 'string', null]
});

cli.main(function(args, options) {
   if(options.warFilepath === null || options.cwd === null)
   {
      cli.getUsage();
      return;
   }
   
   // Call the task
   task.run(options.warFilePath, options.cwd, options.baseDir);
});