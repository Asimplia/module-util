
/// <reference path="../typings/node/node.d.ts" />
/// <reference path="../typings/underscore/underscore.d.ts" />

import IObjectableError = require('./Error/IObjectableError');
import _ = require('underscore');

export = ErrorLogger;
class ErrorLogger {
	
	catchErrors(errorType: any, warningType: any, onError: (e: IObjectableError, type: any) => void) {
		var consoleError = console.error;
		var consoleWarn = console.warn;
		process.on('uncaughtException', (e) => {
			try {
				onError(e, errorType);
			} catch (e) {
				consoleError(e);
			}
		});
		console.error = () => {
			consoleError.apply(this, arguments);
			_.forEach(arguments, (e) => {
				onError(e, errorType);
			});
		};
		console.warn = () => {
			consoleWarn.apply(this, arguments);
			_.forEach(arguments, (e) => {
				onError(e, warningType);
			});
		};
	}

	setToObjectOnError() {
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
	}
}