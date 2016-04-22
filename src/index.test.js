var expect = require('chai').expect;
var index = require('./index.js');

describe('Zapptitude:', function() {
    describe('logEvent', function() {
        it('should be no errors', function () {
            index.logEvent("test_event");
            
        });
    });
    // describe('logBeginTask', function() {
    //     it('should be no errors', function () {
    //         index.logBeginTask("test_task", "test_context");
    //     });
    // });
    // describe('logSolveBinaryTask', function() {
    //     it('should be no errors', function () {
    //         index.logSolveBinaryTask("binary", "test_task", "test_context", "test_topics", true, false);
    //     });
    // });
    // describe('logSolveIntTask', function() {
    //     it('should be no errors', function () {
    //         index.logSolveIntTask("int", "test_task", "test_context", "test_topics", 1, 0);
    //     });
    // });
    // describe('logSolveFloatTask', function() {
    //     it('should be no errors', function () {
    //         index.logSolveFloatTask("float", "test_task", "test_context", "test_topics", 1.2, 0.6);
    //     });
    // });
    // describe('logSolveMCTask', function() {
    //     it('should be no errors', function () {
    //         index.logSolveMCTask("mc", "test_task", "test_context", "test_topics", 'a', 'a', 10);
    //     });
    // });
    // describe('logSolveGradTask', function() {
    //     it('should be no errors', function () {
    //         index.logSolveGradTask("grad", "test_task", "test_context", "test_topics", 1, 2, 10);
    //     });
    // });
});