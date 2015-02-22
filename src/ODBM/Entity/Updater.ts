
import EntityMapper = require('../Mapping/EntityMapper');

export = Updater;
class Updater<Entity, EntityObject> {
	
	constructor(
		private entityMapper: EntityMapper<Entity, EntityObject>
	) {}

	set(entity: Entity, key: string, value: any) {
		var objectPropertyName = this.entityMapper.getObjectPropertyName();
		var object = entity[objectPropertyName];
		object[key] = value;
		return this;
	}
}
