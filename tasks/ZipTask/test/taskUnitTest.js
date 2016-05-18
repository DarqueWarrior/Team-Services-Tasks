var sinon = require('sinon');
var assert = require('assert');
var tl = require('vso-task-lib');
var util = require('../src/utility.js');
var task = require('../src/task.js');

describe('task', function () {
   'use strict';

   it('should run without error', function () {
      /* Arrange */
      var taskSpy = sinon.spy(task, 'run');

      sinon.stub(tl, 'debug');
      
      sinon.stub(util, 'zipFile');

      try {
         /*   Act   */
         task.run("", "");

         /*  Assert */
         assert.ok(true);
      }
      finally {
         taskSpy.restore();
         tl.debug.restore();
         util.zipFile.restore();
         //util.findFiles.restore();
         //util.unzipFile.restore();
      }
   });
});