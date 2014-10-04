
export = AlreadyRunningError;
class AlreadyRunningError implements Error {

	public name: string;

	constructor(
		public message: string
	) {	
		this.name = 'AlreadyRunningError';
	}
}
