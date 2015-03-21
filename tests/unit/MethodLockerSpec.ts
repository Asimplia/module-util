/* tslint:disable:no-unused-variable */
import Util = require('../../src/index');
import MethodLocker = Util.MethodLocker;
import AlreadyLockedError = Util.Error.AlreadyLockedError;

class MockClass {

	private callback: (e: Error, someReturn?: string) => void;

	someMethod(arg1: number, arg2: string, callback: (e: Error, someReturn?: string) => void) {
		this.callback = callback;
	}

	doCallback(e: Error, someReturn?: string) {
		this.callback(e, someReturn);
	}
}

describe('lockMethod', () => {
	var methodLocker = new MethodLocker();

	it('will lock unless method not callback', (done: () => void) => {
		methodLocker.lockMethod(MockClass, 'someMethod');
		var mockClass = new MockClass();
		mockClass.someMethod(113, 'yeah!', (e: Error, someReturn1?: string) => {
			expect(e).toBe(null);
			expect(someReturn1).toBe('done');
		});
		mockClass.someMethod(113, 'yeah!', (e: Error, someReturn2?: string) => {
			expect(e.message).toMatch(
				/Method MockClass\.someMethod:113,yeah\! already running for \d+(\.\d+)?s\. Try it again later./
			);
			expect(someReturn2).toBe(undefined);

			mockClass.doCallback(null, 'done');
			mockClass.someMethod(115, 'maybe...', (e: Error, someReturn3?: string) => {
				expect(e).toBe(null);
				expect(someReturn3).toBe('done twice');
				done();
			});
			mockClass.doCallback(null, 'done twice');
		});
	});
});


describe('unlockProcessingMethod', () => {
	var methodLocker = new MethodLocker();

	it('will unlock processing method to call again', (done: () => void) => {
		methodLocker.unlockMethod(MockClass, 'someMethod');
		methodLocker.lockMethod(MockClass, 'someMethod');
		var mockClass = new MockClass();
		mockClass.someMethod(113, 'yeah!', (e: Error, someReturn1?: string) => {
			var doNothing = 1;
		});
		mockClass.someMethod(113, 'yeah!', (e: Error, someReturn2?: string) => {
			expect(e.message).toMatch(
				/Method MockClass\.someMethod:113,yeah\! already running for \d+(\.\d+)?s\. Try it again later./
			);
			expect(someReturn2).toBe(undefined);

			methodLocker.unlockProcessingMethod(MockClass, 'someMethod');
			mockClass.someMethod(113, 'yeah!', (e: Error, someReturn2?: string) => {
				expect(e).toBe(null);
				expect(someReturn2).toBe('done');
				done();
			});
			mockClass.doCallback(null, 'done');
		});
	});
});


describe('unlockMethod', () => {
	var methodLocker = new MethodLocker();

	it('throw error on again locking', () => {
		methodLocker.unlockMethod(MockClass, 'someMethod');
		methodLocker.lockMethod(MockClass, 'someMethod');
		expect(() => {
			methodLocker.lockMethod(MockClass, 'someMethod');
		}).toThrow(new AlreadyLockedError('Method MockClass.someMethod: already locked.'));
	});
});
