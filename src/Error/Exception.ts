
import IObjectableError = require('./IObjectableError');

declare class ErrorClass implements Error {
	public name: string;
	public message: string;
	constructor(message?: string);
}
eval('ErrorClass = Error');

export = Exception;
class Exception extends ErrorClass implements IObjectableError {

	private _name: string;
	private _message: string;
	private _causedBy: IObjectableError;
	
	get name() { return this._name; }
	get message() { return this._message; }
	get causedBy(): Error { return <any>this._causedBy; }
	get Message() { return this._message; }
	get Name() { return this._name; }
	get Code() { return this._code; }

	constructor(
		e: IObjectableError|Error|string,
		private _code?: number,
		causedBy?: IObjectableError|Error|string
	) {
		super(<any>(e ? (<any>e).message : e));
		if (typeof e === 'object' && (
			typeof e.name !== 'undefined' || typeof e.message !== 'undefined'
		)) {
			this._message = e.message;
			this._name = e.name;
			if (typeof causedBy === 'undefined') {
				this._causedBy = <any>e;
			}
		} else {
			this._name = <any>e;
			this._message = <any>e;
		}
	}

	toObject() {
		return {
			name: this._name,
			message: this._message,
			code: this._code,
			causedBy: this._causedBy && typeof this._causedBy.toObject === 'function' 
				? this._causedBy.toObject()
				: this._causedBy
		};
	}
}
