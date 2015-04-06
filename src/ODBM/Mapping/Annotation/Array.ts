
import Type = require('./Type');
import ITypeStatic = require('./ITypeStatic');
import IEmbeddedAnnotation = require('../../Entity/Annotation/IEmbeddedAnnotation');
import PropertyAnnotationNormalizer = require('../PropertyAnnotationNormalizer');

export = Array;
class Array extends Type {

	private itemType: Type;
	private itemEmbedded: IEmbeddedAnnotation;

	get ItemType() { return this.itemType; }
	get ItemEmbedded() { return this.itemEmbedded; }

	constructor(
		item: Type|ITypeStatic|IEmbeddedAnnotation,
		nullable: boolean = false
	) {
		var type: Type = null;
		if (!(item instanceof Type)) {
			try {
				type = new (<ITypeStatic>item)();
			} catch (e) {
				type = null;
			}
			if (!(type instanceof Type)) {
				type = null;
			}
		} else {
			type = item;
		}
		if (type !== null) {
			this.itemType = type;
		} else {
			var propertyAnnotationNormalizer = new PropertyAnnotationNormalizer();
			var embedded = <IEmbeddedAnnotation>item;
			propertyAnnotationNormalizer.normalizePropertyAnnotations(embedded);
			this.itemEmbedded = embedded;
		}
		super(nullable);
	}
}
