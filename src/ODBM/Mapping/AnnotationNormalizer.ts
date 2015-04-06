
import IEntityStatic = require('../Entity/IEntityStatic');
import PropertyAnnotationNormalizer = require('./PropertyAnnotationNormalizer');

export = AnnotationNormalizer;
class AnnotationNormalizer<Entity, EntityObject> {

	private propertyAnnotationNormalizer: PropertyAnnotationNormalizer;

	constructor(
		private EntityStatic: IEntityStatic<Entity, EntityObject>
	) {
		this.propertyAnnotationNormalizer = new PropertyAnnotationNormalizer();
	}

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
		this.propertyAnnotationNormalizer.normalizePropertyAnnotations(entityAnnotation);
	}
}
