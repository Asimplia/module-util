
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
		var convertedObject = this.convertObject(object, []);
		return new this.EntityStatic(convertedObject);
	}

	toObject(
		entity: Entity
	): EntityObject {
		var objectPropertyName = this.entityMapper.getObjectPropertyName();
		var object = entity[objectPropertyName];
		return this.convertObject(object, []);
	}

	private convertObject(
		object: EntityObject,
		keyPath: string[]
	): EntityObject {
		var keys = this.entityMapper.getEmbeddedKeys.apply(this.entityMapper, keyPath);
		var convertedObject = <EntityObject>{};
		keys.forEach((key: string) => {
			var embeddedKeyPath = [].concat(keyPath, [key]);
			if (this.entityMapper.isEmbeddedByKey.apply(this.entityMapper, embeddedKeyPath)) {
				convertedObject[key] = this.convertObject(
					object[key],
					embeddedKeyPath
				);
			} else {
				var type = this.entityMapper.getPropertyTypeByKey.apply(this.entityMapper, embeddedKeyPath);
				convertedObject[key] = this.propertyConverter.convertByType(
					type,
					object[key]
				);
			}
		});
		return convertedObject;
	}

	fromRow(
		row: any
	): Entity {
		var keys = this.entityMapper.getKeys();
		var object = <EntityObject>{};
		keys.forEach((key: string) => {
			var name = this.entityMapper.getPropertyNameByKey(key);
			object[key] = row[name];
		});
		return this.fromObject(object);
	}

	toRow(
		entity: Entity
	): any {
		var keys = this.entityMapper.getKeys();
		var object = this.toObject(entity);
		var convertedRow: any = {};
		keys.forEach((key: string) => {
			var name = this.entityMapper.getPropertyNameByKey(key);
			convertedRow[name] = object[key];
		});
		return convertedRow;
	}
	
}
