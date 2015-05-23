
import Type = require('./Type');

export = Date;
class Date extends Type {

	get TimeZone() { return this.timeZone; }

	constructor(
		private timeZone: boolean = true,
		nullable: boolean = false
	) {
		super(nullable);
	}
}
