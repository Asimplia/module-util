var Util = require('../../src/index');
var MethodLocker = Util.MethodLocker;

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

    it("will lock unless method not callback", function () {
        methodLocker.lockMethod(MockClass, 'someMethod');
        var mockClass = new MockClass();
        mockClass.someMethod(113, 'yeah!', function (e, someReturn1) {
            mockClass.someMethod(114, 'no.', function (e, someReturn2) {
                expect(e.message).toEqual('Method MockClass.someMethod:113,yeah! already running for #s. Try it again later.');
                mockClass.doCallback(null, 'done');
                mockClass.someMethod(115, 'maybe...', function (e, someReturn3) {
                    expect(someReturn3).toBe('done twice');
                });
                mockClass.doCallback(null, 'done twice');
            });
        });
    });
});
