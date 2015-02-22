
import IEntityAnnotation = require('./Annotation/IEntityAnnotation');

export = IEntityStatic;
interface IEntityStatic<Entity, EntityObject> {
	$entity: IEntityAnnotation;
	new (object: EntityObject): Entity;
}
