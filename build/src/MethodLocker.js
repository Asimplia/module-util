var AlreadyRunningError = require('./Error/AlreadyRunningError');
var moment = require('moment');
var _ = require('underscore');
var hooker = require('hooker');

var MethodLocker = (function () {
    function MethodLocker() {
        this.processingStartTime = {};
        this.processing = {};
        this.processingHookedCallback = {};
    }
    MethodLocker.prototype.lockMethod = function (Class, methodName) {
        hooker.hook(Class.prototype, methodName, {
            pre: this.getLockMethodFunction(Class.name, methodName)
        });
    };

    MethodLocker.prototype.unlockMethod = function (Class, methodName, e) {
        var unlockKey = this.getMethodKey(Class.name, methodName);
        for (var key in this.processing) {
            if (key.substr(0, unlockKey.length) === unlockKey) {
                this.processingHookedCallback[key](e);
            }
        }
    };

    MethodLocker.prototype.getLockMethodFunction = function (className, methodName) {
        var _this = this;
        return function () {
            var callback = _.last(arguments);
            var args = _.initial(arguments);
            var key = _this.getMethodKey(className, methodName) + args.join(',');
            if (_this.processing[key]) {
                callback(new AlreadyRunningError('Method ' + key + ' already running for ' + (_this.now() - _this.processingStartTime[key]) + 's. ' + 'Try it again later.'));
                return hooker.preempt(null);
            }

            _this.processingStartTime[key] = _this.now();
            _this.processing[key] = true;
            var hookedCallback = _this.processingHookedCallback[key] = function () {
                delete _this.processing[key];
                delete _this.processingStartTime[key];
                delete _this.processingHookedCallback[key];
                callback.apply(this, arguments);
            };
            return hooker.filter(this, args.concat([hookedCallback]));
        };
    };

    MethodLocker.prototype.getMethodKey = function (className, methodName) {
        return className + '.' + methodName + ':';
    };

    MethodLocker.prototype.now = function () {
        return moment().valueOf() / 1000;
    };
    return MethodLocker;
})();
module.exports = MethodLocker;
