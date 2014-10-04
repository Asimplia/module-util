var AlreadyRunningError = require('./Error/AlreadyRunningError');
var moment = require('moment');
var _ = require('underscore');
var hooker = require('hooker');

var MethodLocker = (function () {
    function MethodLocker() {
        this.processingStartTime = {};
        this.processing = {};
    }
    MethodLocker.prototype.lockMethod = function (Class, methodName) {
        hooker.hook(Class.prototype, methodName, {
            pre: this.getLockMethodFunction(methodName)
        });
    };

    MethodLocker.prototype.getLockMethodFunction = function (methodName) {
        var _this = this;
        return function () {
            var callback = _.last(arguments);
            var args = _.initial(arguments);
            var key = methodName + ':' + args.join(',');
            if (_this.processing[key]) {
                callback(new AlreadyRunningError('Method ' + key + ' already running for ' + (_this.now() - _this.processingStartTime[key]) + 's. ' + 'Try it again later.'));
                return hooker.preempt(null);
            }

            _this.processingStartTime[key] = _this.now();
            _this.processing[key] = true;
            var hookedCallback = function () {
                _this.processing[key] = false;
                callback.apply(this, arguments);
            };
            return hooker.filter(this, args.concat([hookedCallback]));
        };
    };

    MethodLocker.prototype.now = function () {
        return moment().valueOf() / 1000;
    };
    return MethodLocker;
})();
module.exports = MethodLocker;
