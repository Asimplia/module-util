
import Type = require('./Type');
import ITypeStatic = require('./ITypeStatic');
import AnnotationInteger = require('./Integer');
import IIdentificableType = require('./IIdentificableType');

export = Id;
class Id extends Type {

	private type: Type;
	private noSequence: boolean;

	get Type() { return this.type; }
	get SequenceAllowed() { return !this.noSequence; }

	constructor(
		type: Type|ITypeStatic|IIdentificableType = AnnotationInteger,
		noSequence: boolean = false
	) {
		this.noSequence = noSequence;
		if (!(type instanceof Type)) {
			type = new (<ITypeStatic>type)();
		}
		if (!(type instanceof Type)) {
			throw new Error('Identification type must be instance of Type or constructor of Type');
		}
		if ((<IIdentificableType>type).isIdentificable !== true) {
			throw new Error('Identification type must implements IIdentificableType');
		}
		(<any>type).nullable = !noSequence;
		this.type = <Type>type;
		super(false);
	}
}
