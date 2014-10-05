
export = AlreadyLockedError;
class AlreadyLockedError implements Error {

	public name: string;

	constructor(public message: string) {
		this.name = 'AlreadyLockedError';
	}
}
