
import IEntityStatic = require('../Entity/IEntityStatic');
import Type = require('./Annotation/Type');
import ITypeStatic = require('./Annotation/ITypeStatic');
import IPropertyAnnotation = require('../Entity/Annotation/IPropertyAnnotation');
import IEmbeddedAnnotation = require('../Entity/Annotation/IEmbeddedAnnotation');
import DatabaseSystem = require('../Repository/DatabaseSystem');

export = AnnotationNormalizer;
class AnnotationNormalizer<Entity, EntityObject> {
	
	constructor(
		private EntityStatic: IEntityStatic<Entity, EntityObject>
	) {}

	normalizeEntityAnnotations() {
		var entityAnnotation = this.EntityStatic.$entity;
		if (typeof entityAnnotation.$name === 'undefined') {
			entityAnnotation.$name = (<any>this.EntityStatic).name; // get class name (function name of ES5)
		}
		if (typeof entityAnnotation.$name !== 'string') {
			throw new Error('Entity annotation $name must be string');
		}
		if (typeof entityAnnotation.$object === 'undefined') {
			entityAnnotation.$object = 'object';
		}
		if (typeof entityAnnotation.$object !== 'string') {
			throw new Error('Entity annotation $object must be string');
		}
		var testObject = <any>{ $$testProperty: true };
		var testEntity = new this.EntityStatic(testObject);
		if (testEntity[entityAnnotation.$object] !== testObject) {
			throw new Error('Object passed by constructor must be accessible by propertyName from annotation $object');
		}
		this.normalizePropertyAnnotations(entityAnnotation);
	}

	private normalizePropertyAnnotations(
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
