
import IEntityStatic = require('./IEntityStatic');
import EntityMapper = require('../Mapping/EntityMapper');
import PropertyConverter = require('./Property/Converter');

export = Converter;
class Converter<Entity, EntityObject> {

	private entityMapper: EntityMapper<Entity, EntityObject>;
	private propertyConverter: PropertyConverter

	constructor(
		private EntityStatic: IEntityStatic<Entity, EntityObject>
	) {
		this.entityMapper = new EntityMapper<Entity, EntityObject>(EntityStatic);
		this.propertyConverter = new PropertyConverter();
	}

	fromObject(
		object: EntityObject
	): Entity {
		var keys = this.entityMapper.getKeys();
		var convertedObject = <EntityObject>{};
		keys.forEach((key: string) => {
			var type = this.entityMapper.getPropertyTypeByKey(key);
			convertedObject[key] = this.propertyConverter.convertByType(type, object[key]);
		});
		return new this.EntityStatic(convertedObject);
	}

	toObject(
		entity: Entity
	): EntityObject {
		var objectPropertyName = this.entityMapper.getObjectPropertyName();
		return entity[objectPropertyName];
	}

	fromRow(
		row: any
	): Entity {
		var keys = this.entityMapper.getKeys();
		var object = <EntityObject>{};
		keys.forEach((key: string) => {
			var columnName = this.entityMapper.getPropertyNameByKey(key);
			object[key] = row[columnName];
		});
		return this.fromObject(object);
	}
	
}
