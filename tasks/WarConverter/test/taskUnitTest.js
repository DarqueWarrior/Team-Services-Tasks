/* global it */
/* global describe */

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
        
        // Returning d:\temp\hello.war
        sinon.stub(util, 'findFiles').returns(['d:\\temp\\hello.war']);

        sinon.stub(util, 'unzipFile', function (file, dir, callback) {
            callback();
        });

        sinon.stub(util, 'zipFile');

        try {      
            /*   Act   */
            task.run('**/*.war', 'd:/temp');
      
            /*  Assert */
            // Test that the task did not throw any exceptions
            assert.equal(taskSpy.threw(), false, 'task threw');
        }
        finally {
            taskSpy.restore();
            tl.debug.restore();
            util.zipFile.restore();
            util.findFiles.restore();
            util.unzipFile.restore();
        }
    });
});