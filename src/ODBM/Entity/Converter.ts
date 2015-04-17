
import _ = require('underscore');
import IEntityStatic = require('./IEntityStatic');
import IEntityListStatic = require('./IEntityListStatic');
import EntityMapper = require('../Mapping/EntityMapper');
import EntityUpdater = require('./Updater');
import List = require('./List');

export = Converter;
class Converter<Entity, EntityObject> {

	private entityMapper: EntityMapper<Entity, EntityObject>;
	private entityUpdater: EntityUpdater<Entity, EntityObject>;

	constructor(
		private EntityStatic: IEntityStatic<Entity, EntityObject>
	) {
		this.entityMapper = new EntityMapper<Entity, EntityObject>(EntityStatic);
		this.entityUpdater = new EntityUpdater<Entity, EntityObject>(this.entityMapper);
	}

	getList<EntityList extends List<any>, Entity>(
		EntityListStatic: IEntityListStatic<EntityList, Entity>,
		EntityStatic: IEntityStatic<Entity, any>,
		objects: any[]
	) {
		return objects
			? new EntityListStatic(_.map(objects, (object: any) => this.createEntity<Entity>(EntityStatic, object)))
			: null;
	}

	fromObject(object: EntityObject): Entity {
		var convertedObject = this.convertObject(object, []);
		return this.createEntity<Entity>(this.EntityStatic, convertedObject);
	}

	toObject(entity: Entity): EntityObject {
		var objectPropertyName = this.entityMapper.getObjectPropertyName();
		var object = entity[objectPropertyName];
		return this.convertObject(object, []);
	}

	private createEntity<Entity>(EntityStatic: IEntityStatic<Entity, any>, object: any) {
		var entityMapper = new EntityMapper<Entity, any>(EntityStatic);
		var objectPropertyName = entityMapper.getObjectPropertyName();
		var entity = new EntityStatic();
		entity[objectPropertyName] = object;
		return entity;
	}

	private convertObject(object: EntityObject, keyPath: string[]): EntityObject {
		var convertedObject = this.entityUpdater.updateObject(object, <EntityObject>{}, keyPath);
		return convertedObject;
	}

	fromRow(row: any): Entity {
		var object = this.convertRowToObject(row, []);
		return this.fromObject(object);
	}

	private convertRowToObject(row: any, keyPath: string[]): any {
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

	toRow(entity: Entity): any {
		var converterObject = this.toObject(entity);
		var convertedRow = this.convertObjectToRow(converterObject, []);
		return convertedRow;
	}

	private convertObjectToRow(object: any, keyPath: string[]): any {
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
