
import Type = require('./Type');
import ITypeStatic = require('./ITypeStatic');
import AnnotationInteger = require('./Integer');
import IIdentificableType = require('./IIdentificableType');

export = Id;
class Id extends Type {

	private type: Type; 
	
	constructor(
		type: Type|ITypeStatic|IIdentificableType = AnnotationInteger
	) {
		if (!(type instanceof Type)) {
			type = new (<ITypeStatic>type)();
		}
		if (!(type instanceof Type)) {
			throw new Error('Identification type must be instance of Type or constructor of Type');
		}
		if ((<IIdentificableType>type).isIdentificable !== true) {
			throw new Error('Identification type must implements IIdentificableType');
		}

		this.type = <Type>type;
		super(false);
	}
}
