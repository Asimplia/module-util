
import Type = require('./Type');

export = Date;
class Date extends Type {

	constructor(
		private timeZone: boolean = true,
		nullable: boolean = false
	) {
		super(nullable);
	}
}
