var _ = require('underscore');

var ErrorLogger = (function () {
    function ErrorLogger() {
    }
    ErrorLogger.prototype.catchErrors = function (uncaughtErrorType, errorType, warningType, onError) {
        var _this = this;
        var consoleError = console.error;
        var consoleWarn = console.warn;
        var callOnError = function (e, type) {
            if (!_this.isError(e)) {
                var error = new Error();
                error.causedBy = e;
                onError(error, type);
            } else {
                onError(e, type);
            }
        };
        process.on('uncaughtException', function (e) {
            try  {
                callOnError(e, uncaughtErrorType);
            } catch (e) {
                consoleError(e);
            }
        });
        console.error = function () {
            consoleError.apply(_this, arguments);
            _.forEach(arguments, function (e) {
                callOnError(e, errorType);
            });
        };
        console.warn = function () {
            consoleWarn.apply(_this, arguments);
            _.forEach(arguments, function (e) {
                callOnError(e, warningType);
            });
        };
    };

    ErrorLogger.prototype.setToObjectOnError = function () {
        var properties = ['code', 'name', 'message', 'severity', 'stack', 'inner', 'causedBy'];
        Object.defineProperty(Error.prototype, 'toObject', {
            value: function () {
                return JSON.parse(JSON.stringify(this, properties, 2));
            },
            configurable: true
        });
    };

    ErrorLogger.prototype.isError = function (e) {
        return ('' + e).substr(0, 5) == 'Error';
    };
    return ErrorLogger;
})();
module.exports = ErrorLogger;
