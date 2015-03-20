
import Exception = require('../../../src/Error/Exception');

class MyError implements Error {
	public name: string;
	constructor(
		public message: string
	) {}
}

class MyException extends Exception {}
class YourException extends Exception {}

describe('Error.Exception', () => {

	it('should create by first string', () => {
		var e = new Exception('Hello world');
		var obj = e.toObject();
		expect(typeof obj.stack).toBe('string');
		delete obj.stack;
		expect(obj).toEqual({
			name: 'Exception',
			message: 'Hello world',
			code: undefined,
			causedBy: undefined
		});
	});

	it('should create by first Error instance', () => {
		var err = new Error('message');
		var e = new Exception(err);
		var obj = e.toObject();
		expect(typeof obj.stack).toBe('string');
		delete obj.stack;
		expect(obj).toEqual({
			name: 'Error',
			message: 'message',
			code: undefined,
			causedBy: undefined
		});
	});

	it('should create by first Error instance of child error class', () => {
		var err = new MyError('message');
		var e = new Exception(err);
		var obj = e.toObject();
		expect(typeof obj.stack).toBe('string');
		delete obj.stack;
		expect(obj).toEqual({
			name: 'MyError',
			message: 'message',
			code: undefined,
			causedBy: undefined
		});
	});

	it('should create by first Error instance of child error class', () => {
		var err = new MyError('message');
		var e = new Exception(err);
		var obj = e.toObject();
		expect(typeof obj.stack).toBe('string');
		delete obj.stack;
		expect(obj).toEqual({
			name: 'MyError',
			message: 'message',
			code: undefined,
			causedBy: undefined
		});
	});

	it('should create specific by first Error instance of child error class', () => {
		var err = new MyError('message');
		var e = new MyException(err);
		var obj = e.toObject();
		expect(typeof obj.stack).toBe('string');
		delete obj.stack;
		expect(obj).toEqual({
			name: 'MyError',
			message: 'message',
			code: undefined,
			causedBy: undefined
		});
	});

	it('should create specific by first string', () => {
		var e = new MyException('my message');
		var obj = e.toObject();
		expect(typeof obj.stack).toBe('string');
		delete obj.stack;
		expect(obj).toEqual({
			name: 'MyException',
			message: 'my message',
			code: undefined,
			causedBy: undefined
		});
	});

	it('should create specific by first string & code & causedBy', () => {
		var err = new Error('message');
		var e = new MyException('my message', 113, err);
		var obj = e.toObject();
		expect(typeof obj.stack).toBe('string');
		delete obj.stack;
		expect(obj).toEqual({
			name: 'MyException',
			message: 'my message',
			code: 113,
			causedBy: err
		});
	});

	it('should create specific by first specific Exception', () => {
		var exc = new YourException('message');
		var e = new MyException(exc);
		var obj = e.toObject();
		expect(typeof obj.stack).toBe('string');
		delete obj.stack;
		expect(obj).toEqual({
			name: 'YourException',
			message: 'message',
			code: undefined,
			causedBy: undefined
		});
	});

	it('should create specific with causedBy Exception', () => {
		var exc = new YourException('message your');
		var e = new MyException('message my', undefined, exc);
		var obj = e.toObject();
		expect(typeof obj.stack).toBe('string');
		expect(typeof obj.causedBy.stack).toBe('string');
		delete obj.stack;
		delete obj.causedBy.stack;
		expect(obj).toEqual({
			name: 'MyException',
			message: 'message my',
			code: undefined,
			causedBy: {
				name: 'YourException',
				message: 'message your',
				code: undefined,
				causedBy: undefined
			}
		});
	});

	it('should create specific with multiple Errors', () => {
		var errs = [
			new MyError('my'),
			new Error('his')
		];
		var e = new MyException(errs);
		var obj = e.toObject();
		expect(typeof obj.stack).toBe('string');
		delete obj.stack;
		expect(obj).toEqual({
			name: 'MyException',
			message: 'my, his',
			code: undefined,
			causedBy: undefined
		});
	});
});
