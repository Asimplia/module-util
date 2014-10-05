var Util = require('../../src/index');
var MethodLocker = Util.MethodLocker;
var AlreadyLockedError = Util.Error.AlreadyLockedError;

var MockClass = (function () {
    function MockClass() {
    }
    MockClass.prototype.someMethod = function (arg1, arg2, callback) {
        this.callback = callback;
    };

    MockClass.prototype.doCallback = function (e, someReturn) {
        this.callback(e, someReturn);
    };
    return MockClass;
})();

describe("lockMethod", function () {
    var methodLocker = new MethodLocker();

    it("will lock unless method not callback", function (done) {
        methodLocker.lockMethod(MockClass, 'someMethod');
        var mockClass = new MockClass();
        mockClass.someMethod(113, 'yeah!', function (e, someReturn1) {
            expect(e).toBe(null);
            expect(someReturn1).toBe('done');
        });
        mockClass.someMethod(113, 'yeah!', function (e, someReturn2) {
            expect(e.message).toMatch(/Method MockClass\.someMethod:113,yeah\! already running for \d+(\.\d+)?s\. Try it again later./);
            expect(someReturn2).toBe(undefined);

            mockClass.doCallback(null, 'done');
            mockClass.someMethod(115, 'maybe...', function (e, someReturn3) {
                expect(e).toBe(null);
                expect(someReturn3).toBe('done twice');
                done();
            });
            mockClass.doCallback(null, 'done twice');
        });
    });
});

describe("unlockProcessingMethod", function () {
    var methodLocker = new MethodLocker();

    it("will unlock processing method to call again", function (done) {
        methodLocker.unlockMethod(MockClass, 'someMethod');
        methodLocker.lockMethod(MockClass, 'someMethod');
        var mockClass = new MockClass();
        mockClass.someMethod(113, 'yeah!', function (e, someReturn1) {
        });
        mockClass.someMethod(113, 'yeah!', function (e, someReturn2) {
            expect(e.message).toMatch(/Method MockClass\.someMethod:113,yeah\! already running for \d+(\.\d+)?s\. Try it again later./);
            expect(someReturn2).toBe(undefined);

            methodLocker.unlockProcessingMethod(MockClass, 'someMethod');
            mockClass.someMethod(113, 'yeah!', function (e, someReturn2) {
                expect(e).toBe(null);
                expect(someReturn2).toBe('done');
                done();
            });
            mockClass.doCallback(null, 'done');
        });
    });
});

describe("unlockMethod", function () {
    var methodLocker = new MethodLocker();

    it('throw error on again locking', function () {
        methodLocker.unlockMethod(MockClass, 'someMethod');
        methodLocker.lockMethod(MockClass, 'someMethod');
        expect(function () {
            methodLocker.lockMethod(MockClass, 'someMethod');
        }).toThrow(new AlreadyLockedError('Method MockClass.someMethod: already locked.'));
    });
});
