
import _ = require('underscore');
import IObjectableError = require('./IObjectableError');
import ErrorClass = require('./ErrorClass');

export = Exception;
class Exception extends ErrorClass implements IObjectableError {

	private exName: string;
	private exMessage: string;
	private exCode: number;
	private exCausedBy: Error;
	private originalErrors: Error[];
	private stackTrace: string;

	get name() { return this.exName; }
	get message() { return this.exMessage; }
	get causedBy(): Error { return <any>this.exCausedBy; }
	get Message() { return this.exMessage; }
	get Name() { return this.exName; }
	get Code() { return this.exCode; }
	get Stack() { return this.stackTrace; }

	constructor(
		e: Error|string|Error[],
		code?: number,
		causedBy?: Error
	) {
		if (this.isError(e)) {
			var error = <Error>e;
			this.exName = error.name || this.getClassName(error);
			this.exMessage = error.message;
			this.originalErrors = [error];
		} else if (_.isArray(e)) {
			var errors = <Error[]>e;
			this.exMessage = _.map(<any>e, (e: Error) => { return e.message; }).join(', ');
			this.originalErrors = errors;
		} else {
			this.exMessage = <any>e;
			this.originalErrors = [];
		}
		if (!this.exName) {
			this.exName = this.getClassName();
		}
		super(this.exMessage);
		this.exCausedBy = causedBy;
		this.exCode = code;
		this.stackTrace = (<any>new Error()).stack;
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
		var causedBy = <any>this.exCausedBy;
		return {
			name: this.exName,
			message: this.exMessage,
			code: this.exCode,
			causedBy: this.exCausedBy && typeof causedBy.toObject === 'function'
				? causedBy.toObject()
				: causedBy,
			stack: this.stackTrace
		};
	}
}
