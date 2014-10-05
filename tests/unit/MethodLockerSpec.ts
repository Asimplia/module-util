
/// <reference path="../../typings/jasmine/jasmine.d.ts" />
/// <reference path="../../typings/node/node.d.ts" />

import Util = require('../../src/index');
import MethodLocker = Util.MethodLocker;

class MockClass {

	private callback: (e: Error, someReturn?: string) => void;

	someMethod(arg1: number, arg2: string, callback: (e: Error, someReturn?: string) => void) {
		this.callback = callback;
	}

	doCallback(e: Error, someReturn?: string) {
		this.callback(e, someReturn);
	}
}

describe("lockMethod", () => {
	var methodLocker = new MethodLocker();

	it("will lock unless method not callback", (done: () => void) => {
		methodLocker.lockMethod(MockClass, 'someMethod');
		var mockClass = new MockClass();
		mockClass.someMethod(113, 'yeah!', (e: Error, someReturn1?: string) => {
			expect(e).toBe(null);
			expect(someReturn1).toBe('done');
		});
		mockClass.someMethod(113, 'yeah!', (e: Error, someReturn2?: string) => {
			expect(e.message).toMatch(
				/Method MockClass\.someMethod:113,yeah\! already running for \d+\.\d+s\. Try it again later./
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
