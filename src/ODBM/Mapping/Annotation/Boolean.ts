
import Type = require('./Type');

export = Boolean;
class Boolean extends Type {
	
	constructor(
		nullable: boolean = false
	) {
		super(nullable);
	}
}
