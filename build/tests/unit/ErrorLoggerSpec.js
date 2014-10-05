var Util = require('../../src/index');
var ErrorLogger = Util.ErrorLogger;

describe("catchErrors", function () {
    var errorLogger = new ErrorLogger();
    var defaultConsoleError = console.error;
    var defaultConsoleWarn = console.warn;

    beforeEach(function () {
        process.removeAllListeners('uncaughtException');
        console.error = defaultConsoleError;
        console.warn = defaultConsoleWarn;
    });

    it("will create error.causedBy on console.error", function () {
        errorLogger.catchErrors('error', 'warn', function (e, type) {
            expect(e.causedBy).toEqual('Some text');
            expect(type).toBe('error');
        });
        var e = 'Some text';
        console.error(e);
    });

    it("will log Error on console.error", function () {
        errorLogger.catchErrors('error', 'warn', function (e, type) {
            expect(e.name).toEqual('Error');
            expect(type).toBe('error');
        });
        var e = new Error('some message');
        console.error(e);
    });

    it("will create error.causedBy on console.warn", function () {
        errorLogger.catchErrors('error', 'warn', function (e, type) {
            expect(e.causedBy).toEqual('Some warning');
            expect(type).toBe('warn');
        });
        var e = 'Some warning';
        console.warn(e);
    });

    it("will log Error on console.warn", function () {
        errorLogger.catchErrors('error', 'warn', function (e, type) {
            expect(e.name).toEqual('Error');
            expect(type).toBe('warn');
        });
        var e = new Error('some warning');
        console.warn(e);
    });

    it("will create error.causedBy on uncaughtException", function () {
        errorLogger.catchErrors('error', 'warn', function (e, type) {
            expect(e.causedBy).toEqual('Some warning');
            expect(type).toBe('error');
        });
        var e = 'Some warning';
        process.emit('uncaughtException', e);
    });

    it("will log Error on uncaughtException", function () {
        errorLogger.catchErrors('error', 'warn', function (e, type) {
            expect(e.name).toEqual('Error');
            expect(type).toBe('error');
        });
        var e = new Error('some warning');
        process.emit('uncaughtException', e);
    });
});

describe("setToObjectOnError", function () {
    var errorLogger = new ErrorLogger();
    errorLogger.setToObjectOnError();

    it("will be deep object from real error", function () {
        errorLogger.setToObjectOnError();
        try  {
            var a = {};
            a.noExists();
        } catch (e) {
            expect(e.toObject().message).toEqual("Object #<Object> has no method 'noExists'");
        }
    });

    it("will be deep object", function () {
        errorLogger.setToObjectOnError();
        var e = new Error('abc');
        e.message = 'ghi';
        expect(e.toObject().message).toEqual('ghi');
    });
});
