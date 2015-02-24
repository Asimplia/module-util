
import Type = require('./Type');

export = Float;
class Float extends Type {

	get Length() { return this.length; }
	
	constructor(
		private length: number = 4,
		nullable: boolean = false
	) {
		super(nullable);
	}
}
