
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
				try {
					convertedObject[key] = this.propertyConverter.convertByType(
						type,
						object[key]
					);
				} catch (e) {
					e.object = object;
					e.keyPath = keyPath;
					e.key = key;
					throw e;
				}
			}
		});
		return convertedObject;
	}

	fromRow(
		row: any
	): Entity {
		var object = this.convertRowToObject(row, []);
		return this.fromObject(object);
	}

	private convertRowToObject(
		row: any,
		keyPath: string[]
	): any {
		var keys = this.entityMapper.getEmbeddedKeys.apply(this.entityMapper, keyPath);
		var object: any = {};
		keys.forEach((key: string) => {
			var embeddedKeyPath = [].concat(keyPath, [key]);
			var name = this.entityMapper.getPropertyNameByKey.apply(
				this.entityMapper,
				embeddedKeyPath
			);
			if (this.entityMapper.isEmbeddedByKey.apply(this.entityMapper, embeddedKeyPath)) {
				object[key] = this.convertRowToObject(row[name], embeddedKeyPath);
			} else {
				object[key] = row[name];
			}
		});
		return object;
	}

	toRow(
		entity: Entity
	): any {
		var converterObject = this.toObject(entity);
		var convertedRow = this.convertObjectToRow(converterObject, []);
		return convertedRow;
	}

	private convertObjectToRow(
		object: any,
		keyPath: string[]
	): any {
		var keys = this.entityMapper.getEmbeddedKeys.apply(this.entityMapper, keyPath);
		var row: any = {};
		keys.forEach((key: string) => {
			var embeddedKeyPath = [].concat(keyPath, [key]);
			var name = this.entityMapper.getPropertyNameByKey.apply(
				this.entityMapper,
				embeddedKeyPath
			);
			if (this.entityMapper.isEmbeddedByKey.apply(this.entityMapper, embeddedKeyPath)) {
				row[name] = this.convertObjectToRow(object[key], embeddedKeyPath);
			} else {
				row[name] = object[key];
			}
		});
		return row;
	}
	
}
