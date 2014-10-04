
/// <reference path="../typings/node/node.d.ts" />
/// <reference path="../typings/underscore/underscore.d.ts" />
/// <reference path="../typings/moment/moment.d.ts" />

import AlreadyRunningError = require('./Error/AlreadyRunningError');
import moment = require('moment');
import _ = require('underscore');
var hooker = require('hooker');

export = MethodLocker;
class MethodLocker {

	private processingStartTime: any = {};
	private processing: any = {};
	
	lockMethod(Class: any, methodName: string) {
		hooker.hook(Class.prototype, methodName, {
			pre: this.getLockMethodFunction(methodName)
		});
	}

	private getLockMethodFunction(methodName: string) {
		var _this = this;
		return function () {
			var callback = _.last(arguments);
			var args = _.initial(arguments);
			var key = methodName+':'+args.join(',');
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
			var hookedCallback = function () {
				_this.processing[key] = false;
				callback.apply(this, arguments);
			};
			return hooker.filter(this, args.concat([hookedCallback]));
		};
	}

	private now() {
		return moment().valueOf() / 1000;
	}
}
