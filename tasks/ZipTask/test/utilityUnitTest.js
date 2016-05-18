// http://sinonjs.org/docs/#spies-api
// http://yahooeng.tumblr.com/post/75054690857/code-coverage-for-executable-nodejs-scripts

var fs = require('fs');
var os = require('os');
var sinon = require('sinon');
var assert = require('assert');
var tl = require('vso-task-lib');
var util = require('../src/utility.js');

describe('findFiles', function () {
   it('should find a file when given minimatch pattern', function () {
      /* Arrange */
      sinon.stub(tl, 'debug');
      sinon.stub(tl, 'warning');
      var matchStub = sinon.stub(tl, 'match').returns('d:\\temp\\DockerFile');
      sinon.stub(tl, 'find').returns(['d:\\temp\\DockerFile', 'd:\\temp\\test.txt']);

      var expected = 'd:\\temp\\DockerFile';

      try {
         /* Act */
         var actual = util.findFiles('**/Dockerfile', 'd:\\temp');
        
         /* Assert */
         assert.equal(actual, expected, actual + ' ' + expected + ' Do not match');
         assert.equal(matchStub.calledOnce, true, 'matchStub not called the correct number of times');
      }
      finally {
         tl.find.restore();
         tl.match.restore();
         tl.debug.restore();
         tl.warning.restore();
      }
   });

   it('should return a file when given full path', function () {
      /* Arrange */
      sinon.stub(tl, 'debug');
      sinon.stub(tl, 'warning');
      sinon.stub(tl, 'find').returns(['d:\\temp\\DockerFile']);
      var matchStub = sinon.stub(tl, 'match').returns('d:\\temp\\DockerFile');

      var expected = 'd:\\temp\\DockerFile';

      try {
         /* Act */
         var actual = util.findFiles('d:\\temp\\DockerFile', 'd:\\temp');
        
         /* Assert */
         assert.equal(actual, expected, actual + ' ' + expected + ' Do not match');
         assert.equal(matchStub.callCount, 0, 'matchStub called');
      }
      finally {
         tl.match.restore();
         tl.find.restore();
         tl.debug.restore();
         tl.warning.restore();
      }
   });

   it('should return null when match fails', function () {
      /* Arrange */
      sinon.stub(tl, 'debug');
      sinon.stub(tl, 'warning');
      var matchStub = sinon.stub(tl, 'match').returns(null);

      var expected = null;

      try {
         /* Act */
         var actual = util.findFiles('**/Dockerfile', 'd:\\temp');
        
         /* Assert */
         assert.equal(actual, expected, actual + ' ' + expected + ' Do not match');
         assert.equal(matchStub.calledOnce, true, 'matchStub not called the correct number of times');
      }
      finally {
         tl.match.restore();
         tl.debug.restore();
         tl.warning.restore();
      }
   });
});

describe('format', function () {
   it('should work like c#', function () {
      /* Arrange */
      var expected = 'Hello World';
      
      /* Act     */
      var actual = String.format('{0} {1}', 'Hello', 'World');
      
      /* Assert  */
      assert.equal(actual, expected, actual + ' ' + expected + ' Do not match');
   });
});

describe('rmdir', function () {
   it('should not throw if the folder does not exists', function () {
      /* Arrange */
      // Spy on rmdir to make sure it does not throw and only called once
      var rmdirSpy = sinon.spy(util, 'rmdir');
        
      // Return false to test what happens if the folder passed in does not
      // exists
      sinon.stub(fs, 'existsSync').returns(false);

      try {        
         /* Act */
         // Execute the function
         util.rmdir('z:\\doesNotExist');
        
         /* Assert */
         // Test that rmdir did not throw
         assert.equal(rmdirSpy.threw(), false, 'rmdir threw');
        
         // Test that rmdir was only called once
         assert.equal(rmdirSpy.calledOnce, true, 'rmdir called too often');
      }
      finally {
         rmdirSpy.restore();
         fs.existsSync.restore();
      }
   });

   it('should delete an empty folder', function () {
      /* Arrange */
      // Spy on rmdir to make sure it does not throw and only called once
      var rmdirSpy = sinon.spy(util, 'rmdir');
        
      // Return true so we try to delete the folder
      sinon.stub(fs, 'existsSync').returns(true);
        
      // Return an empty array because we want to test deleting an empty
      // folder
      sinon.stub(fs, 'readdirSync').returns([]);
        
      // Make sure rmdirSync is called on the folder
      var rmdirSyncStub = sinon.stub(fs, 'rmdirSync').withArgs('z:\\temp');

      try {
         /* Act */
         util.rmdir('z:\\temp');
        
         /* Assert */
         // Test that rmdirSync was called only once
         assert.equal(rmdirSyncStub.calledOnce, true, 'rmdirSync was not called');
        
         // Test that rmdir did not throw
         assert.equal(rmdirSpy.threw(), false, 'rmdir threw');
        
         // Test that rmdir was only called once
         assert.equal(rmdirSpy.calledOnce, true, 'rmdir called too often');
      }
      finally {
         util.rmdir.restore();
         fs.existsSync.restore();
         fs.readdirSync.restore();
         fs.rmdirSync.restore();
      }
   });

   it('should delete a folder with a file in it', function () {
      /* Arrange */
      // Return true so we try to delete the folder
      sinon.stub(fs, 'existsSync').returns(true);
        
      // Return a single file because we want to test deleting a folder with
      // files in it
      sinon.stub(fs, 'readdirSync').returns(['file.txt']);
        
      // Make sure rmdirSync is called on the folder
      var rmdirSyncStub = sinon.stub(fs, 'rmdirSync').withArgs('z:\\temp');
        
      // Fake isDirectory to return false
      sinon.stub(fs, 'lstatSync').returns({ isDirectory: function () { return false; } });
        
      // Make sure unlinkSync is called on file.txt
      var unlinkSyncStub = sinon.stub(fs, 'unlinkSync').withArgs('z:\\temp\\file.txt');

      try {
         /* Act */
         util.rmdir('z:\\temp');
        
         /* Assert */
         // Test that unlinkSync was called only once
         assert.equal(unlinkSyncStub.calledOnce, true, 'unlinkSync was not called');
        
         // Test that rmdirSync was called only once
         assert.equal(rmdirSyncStub.calledOnce, true, 'rmdirSync was not called');
      }
      finally {
         fs.existsSync.restore();
         fs.readdirSync.restore();
         fs.rmdirSync.restore();
         fs.lstatSync.restore();
         fs.unlinkSync.restore();
      }
   });

   it('should delete a folder with sub folders', function () {
      /* Arrange */
      // Spy on rmdir to make sure it does not throw and only called twice
      var rmdirSpy = sinon.spy(util, 'rmdir');
        
      // Return true so we try to delete the folder
      sinon.stub(fs, 'existsSync').returns(true);
        
      // Only return files for the first folder
      var readdirSyncStub = sinon.stub(fs, 'readdirSync');
      readdirSyncStub.onCall(0).returns(['file.txt', 'subFolder']);
        
      // The second folder is empty
      readdirSyncStub.onCall(1).returns([]);
        
      // Fake isDirectory to return false
      // First call returns false
      var lstatSyncStub = sinon.stub(fs, 'lstatSync');
      lstatSyncStub.onCall(0).returns({ isDirectory: function () { return false; } });
        
      // Second call returns true
      lstatSyncStub.onCall(1).returns({ isDirectory: function () { return true; } });
        
      // Make sure unlinkSync is called on file.txt
      var unlinkSyncStub = sinon.stub(fs, 'unlinkSync').withArgs('z:\\temp\\file.txt');
        
      // Make sure rmdirSync is called on the folders
      var rmdirSyncStub = sinon.stub(fs, 'rmdirSync');

      try {
         /* Act */
         util.rmdir('z:\\temp');
        
         /* Assert */
         // Test that unlinkSync was called only once
         assert.equal(unlinkSyncStub.calledOnce, true, 'unlinkSync was called the wrong number of times ' + unlinkSyncStub.callCount);
        
         // Test that rmdirSync was called twice
         assert.equal(rmdirSyncStub.calledTwice, true, 'rmdirSync was called the wrong number of times ' + rmdirSyncStub.callCount);
        
         // Test that rmdir did not throw
         assert.equal(rmdirSpy.threw(), false, 'rmdir threw');
      }
      finally {
         rmdirSpy.restore();
         fs.existsSync.restore();
         readdirSyncStub.restore();
         fs.lstatSync.restore();
         fs.unlinkSync.restore();
         fs.rmdirSync.restore();
      }
   });
});

function fakeGetInput(name, required) {
   switch (name) {
      case 'cwd':
         return 'd:\\temp';
      case 'authOptions':
         return 'tls';
      case 'connectedServiceName':
         return 'serviceEndpoint';
   }

   return null;
}