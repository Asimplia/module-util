
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
		expect(e.toObject()).toEqual({
			name: 'Exception',
			message: 'Hello world',
			code: undefined,
			causedBy: undefined
		});
	});
	
	it('should create by first Error instance', () => {
		var err = new Error('message');
		var e = new Exception(err);
		expect(e.toObject()).toEqual({
			name: 'Error',
			message: 'message',
			code: undefined,
			causedBy: undefined
		});
	});
	
	it('should create by first Error instance of child error class', () => {
		var err = new MyError('message');
		var e = new Exception(err);
		expect(e.toObject()).toEqual({
			name: 'MyError',
			message: 'message',
			code: undefined,
			causedBy: undefined
		});
	});
	
	it('should create by first Error instance of child error class', () => {
		var err = new MyError('message');
		var e = new Exception(err);
		expect(e.toObject()).toEqual({
			name: 'MyError',
			message: 'message',
			code: undefined,
			causedBy: undefined
		});
	});
	
	it('should create specific by first Error instance of child error class', () => {
		var err = new MyError('message');
		var e = new MyException(err);
		expect(e.toObject()).toEqual({
			name: 'MyError',
			message: 'message',
			code: undefined,
			causedBy: undefined
		});
	});
	
	it('should create specific by first string', () => {
		var e = new MyException('my message');
		expect(e.toObject()).toEqual({
			name: 'MyException',
			message: 'my message',
			code: undefined,
			causedBy: undefined
		});
	});
	
	it('should create specific by first string & code & causedBy', () => {
		var err = new Error('message');
		var e = new MyException('my message', 113, err);
		expect(e.toObject()).toEqual({
			name: 'MyException',
			message: 'my message',
			code: 113,
			causedBy: err
		});
	});
	
	it('should create specific by first specific Exception', () => {
		var exc = new YourException('message');
		var e = new MyException(exc);
		expect(e.toObject()).toEqual({
			name: 'YourException',
			message: 'message',
			code: undefined,
			causedBy: undefined
		});
	});
	
	it('should create specific with causedBy Exception', () => {
		var exc = new YourException('message your');
		var e = new MyException('message my', undefined, exc);
		expect(e.toObject()).toEqual({
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
		expect(e.toObject()).toEqual({
			name: 'MyException',
			message: 'my, his',
			code: undefined,
			causedBy: undefined
		});
	});
});