
export = IObjectableError;
interface IObjectableError extends Error {
	toObject(): any;
}
