
import EntityMapper = require('../Mapping/EntityMapper');
import PropertyConverter = require('./Property/Converter');

export = Updater;
class Updater<Entity, EntityObject> {

	private propertyConverter: PropertyConverter;

	constructor(
		private entityMapper: EntityMapper<Entity, EntityObject>
	) {
		this.propertyConverter = new PropertyConverter();
	}

	set(entity: Entity, key: string, value: any) {
		var propertyType = this.entityMapper.getPropertyTypeByKey(key);
		var objectPropertyName = this.entityMapper.getObjectPropertyName();
		var object = entity[objectPropertyName];
		object[key] = this.propertyConverter.convertByType(propertyType, value);
		return this;
	}

	get(entity: Entity, key: string): any {
		var propertyType = this.entityMapper.getPropertyTypeByKey(key);
		var objectPropertyName = this.entityMapper.getObjectPropertyName();
		var object = entity[objectPropertyName];
		return this.propertyConverter.convertByType(propertyType, object[key]);
	}
}
