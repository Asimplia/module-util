
import AlreadyRunningError = require('./Error/AlreadyRunningError');
import AlreadyLockedError = require('./Error/AlreadyLockedError');
import moment = require('moment');
import _ = require('underscore');
var hooker = require('hooker');

export = MethodLocker;
class MethodLocker {

	private lockedMethod: any = {};
	private processingStartTime: any = {};
	private processing: any = {};
	private processingHookedCallback: any = {};
	
	lockMethod(Class: any, methodName: string) {
		var lockKey = this.getMethodKey(Class.name, methodName);
		if (this.lockedMethod[lockKey]) {
			throw new AlreadyLockedError('Method '+lockKey+' already locked.');
		}
		this.lockedMethod[lockKey] = true;
		hooker.hook(Class.prototype, methodName, {
			pre: this.getLockMethodFunction(Class.name, methodName)
		});
	}

	unlockMethod(Class: any, methodName: string) {
		var lockKey = this.getMethodKey(Class.name, methodName);
		hooker.unhook(Class.prototype, methodName);
		delete this.lockedMethod[lockKey];
	}

	// TODO unlock for specified arguments
	unlockProcessingMethod(Class: any, methodName: string, e?: Error) {
		var unlockKey = this.getMethodKey(Class.name, methodName);
		for (var key in this.processing) {
			if (key.substr(0, unlockKey.length) === unlockKey) {
				this.processingHookedCallback[key](e);
			}
		}
	}

	private getLockMethodFunction(className: string, methodName: string) {
		var lockKey = this.getMethodKey(className, methodName);
		this.lockedMethod[lockKey] = true;
		var _this = this;
		return function () {
			var callback = _.last(arguments);
			var args = _.initial(arguments);
			var key = _this.getMethodKey(className, methodName) + args.join(',');
			if (_this.processing[key]) {
				callback(new AlreadyRunningError(
					'Method '+key+' already running for '
					+(_this.now() - _this.processingStartTime[key])+'s. '
					+'Try it again later.'
				));
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
	}

	private getMethodKey(className: string, methodName: string) {
		return className+'.'+methodName+':';
	}

	private now() {
		return moment().valueOf() / 1000;
	}
}
