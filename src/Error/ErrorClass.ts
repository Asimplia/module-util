
export = ErrorClass;
declare class ErrorClass implements Error {
	public name: string;
	public message: string;
	constructor(message?: string);
}
// Setup ErrorClass static by Error
/* tslint:disable */
eval('ErrorClass = Error');
