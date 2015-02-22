
import Type = require('./Type');
import IIdentificableType = require('./IIdentificableType');

export = String;
class String extends Type implements IIdentificableType {
	
	isIdentificable = true;

	constructor(
		private length: number = 50, 
		nullable: boolean = false
	) {
		super(nullable);
	}
}
