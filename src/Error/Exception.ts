
import _ = require('underscore');
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
	private _code: number;
	private _causedBy: Error;
	private _errors: Error[];
	
	get name() { return this._name; }
	get message() { return this._message; }
	get causedBy(): Error { return <any>this._causedBy; }
	get Message() { return this._message; }
	get Name() { return this._name; }
	get Code() { return this._code; }

	constructor(
		e: Error|string|Error[],
		code?: number,
		causedBy?: Error
	) {
		if (this.isError(e)) {
			var error = <Error>e;
			this._name = error.name || this.getClassName(error);;
			this._message = error.message;
			this._errors = [error];
		} else if (_.isArray(e)) {
			var errors = <Error[]>e;
			this._message = _.map(<any>e, (e: Error) => { return e.message; }).join(', ');
			this._errors = errors;
		} else {
			this._message = <any>e;
			this._errors = [];
		}
		if (!this._name) {
			this._name = this.getClassName();
		}
		super(this._message);
		this._causedBy = causedBy;
		this._code = code;
	}

	private isError(e: any) {
		return typeof e === 'object' && (
			typeof e.name !== 'undefined' || typeof e.message !== 'undefined'
		);
	}

	private getClassName(error: any = this) {
		return error.__proto__.constructor.name;
	}

	toObject() {
		var causedBy = <any>this._causedBy;
		return {
			name: this._name,
			message: this._message,
			code: this._code,
			causedBy: this._causedBy && typeof causedBy.toObject === 'function' 
				? causedBy.toObject()
				: causedBy
		};
	}
}
