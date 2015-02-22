
import Type = require('./Type');
import IIdentificableType = require('./IIdentificableType');

export = Integer;
class Integer extends Type implements IIdentificableType {

	isIdentificable = true;

	get Length() { return this.length; }
	
	constructor(
		private length: number = 8, 
		nullable: boolean = false
	) {
		super(nullable);
	}
}
