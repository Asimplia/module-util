
import Exception = require('../../../Error/Exception');

export = MoreThenOneResultException;
class MoreThenOneResultException extends Exception {
	constructor(
		private results: any[]
	) {
		super('Found ' + results.length + ' results');
	}
}
