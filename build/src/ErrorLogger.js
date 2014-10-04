var _ = require('underscore');

var ErrorLogger = (function () {
    function ErrorLogger() {
    }
    ErrorLogger.prototype.catchErrors = function (errorType, warningType, onError) {
        var _this = this;
        var consoleError = console.error;
        var consoleWarn = console.warn;
        process.on('uncaughtException', function (e) {
            try  {
                onError(e, errorType);
            } catch (e) {
                consoleError(e);
            }
        });
        console.error = function () {
            consoleError.apply(_this, arguments);
            _.forEach(arguments, function (e) {
                onError(e, errorType);
            });
        };
        console.warn = function () {
            consoleWarn.apply(_this, arguments);
            _.forEach(arguments, function (e) {
                onError(e, warningType);
            });
        };
    };

    ErrorLogger.prototype.setToObjectOnError = function () {
        Object.defineProperty(Error.prototype, 'toObject', {
            value: function () {
                var alt = {};
                Object.getOwnPropertyNames(this).forEach(function (key) {
                    alt[key] = this[key];
                }, this);

                return alt;
            },
            configurable: true
        });
    };
    return ErrorLogger;
})();
module.exports = ErrorLogger;
