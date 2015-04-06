
import Type = require('./Annotation/Type');
import ITypeStatic = require('./Annotation/ITypeStatic');
import IPropertyAnnotation = require('../Entity/Annotation/IPropertyAnnotation');
import IEmbeddedAnnotation = require('../Entity/Annotation/IEmbeddedAnnotation');
import DatabaseSystem = require('../Repository/DatabaseSystem');

export = PropertyAnnotationNormalizer;
class PropertyAnnotationNormalizer {

	normalizePropertyAnnotations(
		embeddedAnnotation: IEmbeddedAnnotation
	) {
		var keys = Object.keys(embeddedAnnotation);
		keys.forEach((key: string) => {
			if (key.substr(0, 1) === '$') {
				return;
			}
			var propertyAnnotation = <IPropertyAnnotation>embeddedAnnotation[key];
			if (propertyAnnotation instanceof Type || this.isTypeStatic(propertyAnnotation)) {
				embeddedAnnotation[key] = propertyAnnotation = <IPropertyAnnotation><any>{
					$type: propertyAnnotation
				};
			}
			if (typeof propertyAnnotation.$type === 'undefined') {
				this.normalizePropertyAnnotations(propertyAnnotation);
			} else {
				if (!(propertyAnnotation.$type instanceof Type)) {
					propertyAnnotation.$type = new (<ITypeStatic>propertyAnnotation.$type)();
				}
				if (!(propertyAnnotation.$type instanceof Type)) {
					throw new Error('Type must be instance of Type or constructor of Type');
				}
			}
			if (typeof propertyAnnotation.$name === 'undefined') {
				propertyAnnotation.$name = key;
			}
		});
	}

	private isTypeStatic(
		propertyAnnotation: IPropertyAnnotation|Type|ITypeStatic|DatabaseSystem|string
	) {
		return typeof propertyAnnotation === 'function'
			&& (new (<ITypeStatic>propertyAnnotation)()) instanceof Type;
	}
}
