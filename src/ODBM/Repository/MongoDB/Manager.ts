
import mongoose = require('mongoose'); // only for typing
import each = require('each');
import IManager = require('../IManager');
import ModelBuilder = require('./ModelBuilder');
import IEntityStatic = require('../../Entity/IEntityStatic');
import IEntityListStatic = require('../../Entity/IEntityListStatic');
import Converter = require('../../Entity/Converter');
import EntityMapper = require('../../Mapping/EntityMapper');
import Updater = require('../../Entity/Updater');
import List = require('../../Entity/List');

// TODO move it to mongoose.d.ts & DefinitelyTyped repo
interface IMongooseCollection {
	insert(docs: any[], callback: (e: Error, docs?: mongoose.Document[]) => void): void;
}

export = Manager;
class Manager<Entity, EntityObject, EntityList extends List<any/*Entity*/>> implements IManager<Entity, EntityObject, EntityList> {

	private converter: Converter<Entity, EntityObject>;
	private entityMapper: EntityMapper<Entity, EntityObject>;
	private entityUpdater: Updater<Entity, EntityObject>;
	private model: mongoose.Model<mongoose.Document>;

	get Model() { return this.model; }
	get Converter() { return this.converter; }

	constructor(
		private EntityStatic: IEntityStatic<Entity, EntityObject>,
		private EntityListStatic: IEntityListStatic<EntityList, Entity>,
		private connection: mongoose.Mongoose
	) {
		this.converter = new Converter<Entity, EntityObject>(EntityStatic);
		this.entityMapper = new EntityMapper<Entity, EntityObject>(EntityStatic);
		this.entityUpdater = new Updater<Entity, EntityObject>(this.entityMapper);
		var modelBuilder = new ModelBuilder<Entity, EntityObject>(this.entityMapper, this.connection);
		this.model = modelBuilder.create();
	}

	private autoIncrementIdsOfList(
		entityList: List<Entity>,
		callback: (e: Error, entityList?: List<Entity>) => void)
	: void {
		this.getNextId((e: Error, nextId?: number) => {
			if (e) return callback(e);
			entityList.forEach((entity: Entity) => {
				var idKey = this.entityMapper.getIdKey();
				var id = this.entityUpdater.get(entity, idKey);
				if (id === null) {
					this.entityUpdater.set(entity, idKey, nextId++);
				}
			});
			callback(null, entityList);
		});
	}

	insertList(entityList: List<Entity>, callback: (e: Error, entityList?: List<Entity>) => void): IManager<Entity, EntityObject, EntityList> {
		this.autoIncrementIdsOfList(entityList, (e: Error, entityList?: List<Entity>) => {
			if (e) return callback(e);
			var objects = entityList.toArray(this.converter.toObject);
			(<IMongooseCollection>this.model.collection).insert(
				objects,
				(e: Error, docs?: mongoose.Document[]) => {
				if (e) return callback(e);
				callback(null, entityList);
			});
		});
		return this;
	}

	private getIds(entityList: List<Entity>) {
		var idKey = this.entityMapper.getIdKey();
		var ids = entityList.map((entity: Entity) => {
			return this.entityUpdater.get(entity, idKey);
		}).filter((id: number) => {
			return id !== null;
		}).toArray();
		return ids;
	}

	updateList(entityList: List<Entity>, callback: (e: Error, entityList?: List<Entity>) => void): IManager<Entity, EntityObject, EntityList> {
		var idKey = this.entityMapper.getIdKey();
		var idName = this.entityMapper.getIdName();
		var ids = this.getIds(entityList);
		var condition: any = {};
		condition[idName] = { $in: ids };
		this.model.find(condition)
		.exec((e: Error, docs?: mongoose.Document[]) => {
			if (e) return callback(e);
			if (docs.length != entityList.count()) {
				return callback(new Error('Not found all entities to update. Use insertOrUpdate.'));
			}
			var indexedById = entityList.index((entity: Entity) => {
				return this.entityUpdater.get(entity, idKey);
			});
			each(docs)
			.on('item', (doc: mongoose.Document, next: (e?: Error) => void) => {
				var loadedEntity = this.converter.fromRow(doc.toObject());
				var loadedEntityId = this.entityUpdater.get(loadedEntity, idKey);
				var entity = indexedById[loadedEntityId];
				this.updateDocument(entity, doc, next);
			})
			.on('error', (e: Error) => {
				callback(e);
			})
			.on('end', () => {
				callback(null, entityList);
			});
		});
		return this;
	}

	insertOrUpdateList(
		entityList: List<Entity>,
		callback: (e: Error, entityList?: List<Entity>) => void)
	: IManager<Entity, EntityObject, EntityList> {
		var idKey = this.entityMapper.getIdKey();
		var idName = this.entityMapper.getIdName();
		var ids = this.getIds(entityList);
		var condition: any = {};
		condition[idName] = { $in: ids };
		this.model.find(condition)
		.exec((e: Error, docs?: mongoose.Document[]) => {
			if (e) return callback(e);
			var loadedIds = _.map(docs, (doc: mongoose.Document) => {
				var loadedEntity = this.converter.fromRow(doc.toObject());
				return this.entityUpdater.get(loadedEntity, idKey);
			});
			var listToInsert = entityList.filter((entity: Entity) => {
				var id = this.entityUpdater.get(entity, idKey);
				return loadedIds.indexOf(id) === -1;
			});
			var listToUpdate = entityList.filter((entity: Entity) => {
				var id = this.entityUpdater.get(entity, idKey);
				return loadedIds.indexOf(id) !== -1;
			});

			var processCallbacks = [];
			if (listToInsert.count()) {
				processCallbacks.push((next: () => void) => {
					this.insertList(listToInsert, next);
				});
			}
			if (listToUpdate.count()) {
				processCallbacks.push((next: () => void) => {
					this.updateList(listToUpdate, next);
				});
			}
			each(processCallbacks)
			.on('item', (
				process: (next: (e?: Error) => void) => void,
				next: (e?: Error) => void
			) => {
				process(next);
			})
			.on('error', (e: Error) => {
				callback(e);
			})
			.on('end', () => {
				callback(null, entityList);
			});
		});
		return this;
	}

	insertOrUpdate(entity: Entity, callback: (e: Error, entity?: Entity) => void): IManager<Entity, EntityObject, EntityList> {
		var idKey = this.entityMapper.getIdKey();
		var idName = this.entityMapper.getIdName();
		var id = this.entityUpdater.get(entity, idKey);
		if (id) {
			var condition: any = {};
			condition[idName] = id;
			this.model.findOne(condition)
			.exec((e: Error, doc: mongoose.Document) => {
				if (e) return callback(e);
				if (doc) {
					this.updateDocument(entity, doc, callback);
				} else {
					this.insert(entity, callback);
				}
			});
		} else {
			this.insert(entity, callback);
		}
		return this;
	}

	update(entity: Entity, callback: (e: Error, entity?: Entity) => void): IManager<Entity, EntityObject, EntityList> {
		var idKey = this.entityMapper.getIdKey();
		var idName = this.entityMapper.getIdName();
		var id = this.entityUpdater.get(entity, idKey);
		var condition: any = {};
		condition[idName] = id;
		this.model.findOne(condition)
		.exec((e: Error, doc: mongoose.Document) => {
			if (e) return callback(e);
			if (!doc) {
				return callback(new Error('Entity not found'));
			}
			this.updateDocument(entity, doc, callback);
		});
		return this;
	}

	private updateDocument(
		entity: Entity,
		doc: mongoose.Document,
		callback: (e: Error, entity?: Entity) => void
	) {
		var row = this.converter.toRow(entity);
		doc.update(row, {}, (e: Error, affectedRows: number) => {
			if (e) return callback(e);
			callback(null, entity);
		});
	}

	insert(entity: Entity, callback: (e: Error, entity?: Entity) => void): IManager<Entity, EntityObject, EntityList> {
		var idKey = this.entityMapper.getIdKey();
		var id = this.entityUpdater.get(entity, idKey);
		if (id) {
			this.insertWithId(entity, callback);
		} else {
			this.getNextId((e: Error, id?: number) => {
				if (e) return callback(e);
				this.entityUpdater.set(entity, idKey, id);
				this.insertWithId(entity, callback);
			});
		}
		return this;
	}

	private insertWithId(entity: Entity, callback: (e: Error, entity?: Entity) => void) {
		var row = this.converter.toRow(entity);
		var doc = new this.Model(row);
		doc.update(row, { upsert: true }, (e: Error, affectedRows: number) => {
			if (e) return callback(e);
			callback(null, entity);
		});
	}

	private getNextId(callback: (e: Error, id?: number) => void) {
		var idKey = this.entityMapper.getIdKey();
		var idName = this.entityMapper.getIdName();
		var fetchProperties: any = {};
		fetchProperties[idName] = true;
		this.model.findOne({}, fetchProperties)
		.sort('-' + idName)
		.limit(1)
		.exec((e: Error, doc: mongoose.Document) => {
			if (e) return callback(e);
			if (!doc) {
				return callback(null, 1);
			}
			callback(null, 1 + parseInt(doc.id, 10));
		});
	}
}
