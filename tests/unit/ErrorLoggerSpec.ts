/* tslint:disable:no-unused-variable */
import Util = require('../../src/index');
import ErrorLogger = Util.ErrorLogger;
import IObjectableError = Util.Error.IObjectableError;

describe('catchErrors', () => {
	var errorLogger = new ErrorLogger();
	var defaultConsoleError = console.error;
	var defaultConsoleWarn = console.warn;

	var resetConsole = () => {
		process.removeAllListeners('uncaughtException');
		console.error = defaultConsoleError;
		console.warn = defaultConsoleWarn;
	};
	beforeEach(resetConsole);
	afterEach(resetConsole);

	it('will create error.causedBy on console.error', () => {
		errorLogger.catchErrors('uncaught', 'error', 'warn', (e: IObjectableError, type: string) => {
			expect(e.causedBy).toEqual('Some text');
			expect(type).toBe('error');
		});
		var e = 'Some text';
		console.error(e);
	});

	it('will log Error on console.error', () => {
		errorLogger.catchErrors('uncaught', 'error', 'warn', (e: IObjectableError, type: string) => {
			expect(e.name).toEqual('Error');
			expect(type).toBe('error');
		});
		var e = new Error('some message');
		console.error(e);
	});

	it('will create error.causedBy on console.warn', () => {
		errorLogger.catchErrors('uncaught', 'error', 'warn', (e: IObjectableError, type: string) => {
			expect(e.causedBy).toEqual('Some warning');
			expect(type).toBe('warn');
		});
		var e = 'Some warning';
		console.warn(e);
	});

	it('will log Error on console.warn', () => {
		errorLogger.catchErrors('uncaught', 'error', 'warn', (e: IObjectableError, type: string) => {
			expect(e.name).toEqual('Error');
			expect(type).toBe('warn');
		});
		var e = new Error('some warning');
		console.warn(e);
	});

	it('will create error.causedBy on uncaughtException', () => {
		errorLogger.catchErrors('uncaught', 'error', 'warn', (e: IObjectableError, type: string) => {
			expect(e.causedBy).toEqual('Some warning');
			expect(type).toBe('uncaught');
		});
		var e = 'Some warning';
		process.emit('uncaughtException', e);
	});

	it('will log Error on uncaughtException', () => {
		errorLogger.catchErrors('uncaught', 'error', 'warn', (e: IObjectableError, type: string) => {
			expect(e.name).toEqual('Error');
			expect(type).toBe('uncaught');
		});
		var e = new Error('some warning');
		process.emit('uncaughtException', e);
	});
});

describe('setToObjectOnError', () => {
	var errorLogger = new ErrorLogger();
	var defaultToObject = (<any>Error).prototype.toObject;
	var resetConsole = () => {
		(<any>Error).prototype.toObject = defaultToObject;
	};
	beforeEach(resetConsole);
	afterEach(resetConsole);

	it('will be deep object from real error', () => {
		errorLogger.setToObjectOnError();
		try {
			var a: any = {};
			a.noExists();
		} catch (e) {
			expect(e.toObject().message).toEqual('Object #<Object> has no method \'noExists\'');
		}
	});

	it('will be deep object', () => {
		errorLogger.setToObjectOnError();
		var e = <IObjectableError>new Error('abc');
		e.message = 'ghi';
		expect(e.toObject().message).toEqual('ghi');
	});
});
