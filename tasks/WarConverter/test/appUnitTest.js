/* global it */
/* global describe */

var sinon = require('sinon');
var assert = require('assert');
var tl = require('vso-task-lib');
var task = require('../src/task.js');

describe('app', function () {
   'use strict';

   it('should run the task', function () {
      /* Arrange */
      var taskStub = sinon.stub(task, 'run');
      taskStub.withArgs('**/*.war', 'd:/temp');

      sinon.stub(tl, 'debug');

      var input = sinon.stub(tl, 'getInput');
      input.withArgs('cwd').returns('d:/temp');

      var pathInput = sinon.stub(tl, 'getPathInput');
      pathInput.withArgs('warFilePath').returns('**/*.war');
      
      var getVar = sinon.stub(tl, 'getVariable');
      getVar.withArgs('agent.buildDirectory').returns('d:/temp');

      try {      
         /*   Act   */
         // requiring the app.js file should cause the task to be run
         require('../src/app.js');
      
         /*  Assert */
         // Test that the task was called
         assert.equal(taskStub.calledOnce, true, 'task.run was not called');
         
         // Test that is was called with the correct values
         assert.equal(taskStub.getCall(0).args[0], '**/*.war', 'warFilePath arg is not correct. ' + taskStub.getCall(0).args[0]);
         assert.equal(taskStub.getCall(0).args[1], 'd:/temp', 'dir arg is not correct. ' + taskStub.getCall(0).args[1]);
         
         assert.equal(input.calledOnce, true, 'tl.getInput not called ' + input.callCount);
         assert.equal(input.getCall(0).args[0], 'cwd', 'name arg is not correct ' + input.getCall(0).args[0]);
         assert.equal(pathInput.calledOnce, true, 'tl.getPathInput not called ' + pathInput.callCount);
         assert.equal(pathInput.getCall(0).args[0], 'warFilePath', 'name arg is not correct ' + pathInput.getCall(0).args[0]);
      }
      finally {
         taskStub.restore();
         tl.debug.restore();
         tl.getInput.restore();
         tl.getVariable.restore();
         tl.getPathInput.restore();
      }
   });
});