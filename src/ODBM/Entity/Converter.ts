
import IEntityStatic = require('./IEntityStatic');
import EntityMapper = require('../Mapping/EntityMapper');

export = Converter;
class Converter<Entity, EntityObject> {

	private entityMapper: EntityMapper<Entity, EntityObject>;

	constructor(
		private EntityStatic: IEntityStatic<Entity, EntityObject>
	) {
		this.entityMapper = new EntityMapper<Entity, EntityObject>(EntityStatic);
	}

	fromObject(
		object: EntityObject
	): Entity {
		return new this.EntityStatic(object);
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
		throw new Error('Not implemented');
		return null; // TODO
	}
	
}
