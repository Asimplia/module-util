
import IObjectableError = require('./Error/IObjectableError');
import _ = require('underscore');

export = ErrorLogger;
class ErrorLogger {

	catchErrors(
		uncaughtErrorType: any,
		errorType: any,
		warningType: any,
		onError: (e: IObjectableError, type: any) => void
	) {
		var consoleError = console.error;
		var consoleWarn = console.warn;
		var callOnError = (e: IObjectableError, type: any) => {
			if (!this.isError(e)) {
				var error = <IObjectableError>new Error();
				error.causedBy = e;
				onError(error, type);
			} else {
				onError(e, type);
			}
		};
		process.on('uncaughtException', (e: IObjectableError) => {
			try {
				callOnError(e, uncaughtErrorType);
			} catch (e) {
				consoleError(e);
			}
		});
		console.error = (...args: any[]) => {
			consoleError.apply(this, args);
			_.forEach(args, (e: IObjectableError) => {
				callOnError(e, errorType);
			});
		};
		console.warn = (...args: any[]) => {
			consoleWarn.apply(this, args);
			_.forEach(args, (e: IObjectableError) => {
				callOnError(e, warningType);
			});
		};
	}

	setToObjectOnError() {
		var properties = ['code', 'name', 'message', 'severity', 'stack', 'inner', 'causedBy'];
		Object.defineProperty(Error.prototype, 'toObject', {
			value: function () {
				return JSON.parse(JSON.stringify(this, properties, 2));
			},
			configurable: true
		});
	}

	private isError(e: any) {
		return typeof e == 'object' && ('' + e).substr(0, 5) == 'Error';
	}
}
