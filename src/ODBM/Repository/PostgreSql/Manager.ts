
import IManager = require('../IManager');
import IEntityStatic = require('../../Entity/IEntityStatic');
import IEntityListStatic = require('../../Entity/IEntityListStatic');
import SqlBuilder = require('./SqlBuilder');
import Converter = require('../../Entity/Converter');
import EntityMapper = require('../../Mapping/EntityMapper');
import Updater = require('../../Entity/Updater');
import List = require('../../Entity/List');
import each = require('each');
import MoreThenOneResultException = require('../Exception/MoreThenOneResultException');

export = Manager;
class Manager<Entity, EntityObject, EntityList extends List<any/*Entity*/>> implements IManager<Entity, EntityObject, EntityList> {

	private converter: Converter<Entity, EntityObject>;
	private entityMapper: EntityMapper<Entity, EntityObject>;
	private entityUpdater: Updater<Entity, EntityObject>;
	private sqlBuilder: SqlBuilder<Entity>;

	constructor(
		private EntityStatic: IEntityStatic<Entity, EntityObject>,
		private EntityListStatic: IEntityListStatic<EntityList, Entity>,
		private connection: any
	) {
		this.converter = new Converter<Entity, EntityObject>(EntityStatic);
		this.entityMapper = new EntityMapper<Entity, EntityObject>(EntityStatic);
		this.entityUpdater = new Updater<Entity, EntityObject>(this.entityMapper);
		this.sqlBuilder = new SqlBuilder<Entity>(this.converter, this.entityMapper);
	}
	
	insert(entity: Entity, callback: (e: Error, entity?: Entity) => void): IManager<Entity, EntityObject, EntityList> {
		this.insertList(new this.EntityListStatic([entity]), (e: Error, entityList?: EntityList) => {
			if (e) return callback(e);
			callback(null, entityList.first());
		});
		return this;
	}

	insertList(entityList: EntityList, callback: (e: Error, entityList?: EntityList) => void): IManager<Entity, EntityObject, EntityList> {
		if (entityList.isEmpty()) {
			callback(null, entityList);
			return;
		}
		var entityLists = entityList.chunk(1000);
		each(entityLists)
		.on('item', (batchEntityList: EntityList, next: Function) => {
			var queryParamsPair = this.sqlBuilder.createInsertList(batchEntityList);
			this.connection.query(
				queryParamsPair.query, 
				queryParamsPair.params, 
				(e: Error, result: any) =>
			{
				if (e) return callback(e);
				result.rows.forEach((row: any, i: number) => {
					var entity = batchEntityList.get(i);
					this.entityUpdater.set(
						entity,
						this.entityMapper.getIdKey(), 
						row[this.entityMapper.getIdName()]
					);
				});
				next(null, batchEntityList);
			});
		})
		.on('error', (e: Error) => callback(e))
		.on('end', () => callback(null, entityList));

		return this;
	}

	fetchListBy(conditions: any, callback: (e: Error, entityList?: EntityList) => void): IManager<Entity, EntityObject, EntityList> {
		var queryParamsPair = this.sqlBuilder.createSelectByConditions(conditions);
		this.connection.query(
			queryParamsPair.query, 
			queryParamsPair.params, 
			(e: Error, result: any) =>
		{
			if (e) return callback(e);
			var entities = [];
			result.rows.forEach((row: any, i: number) => {
				var entity = this.converter.fromRow(row);
				entities.push(entity);
			});
			callback(null, new this.EntityListStatic(entities));
		});

		return this;
	}

	fetchBy(conditions: any, callback: (e: Error, entity?: Entity) => void): IManager<Entity, EntityObject, EntityList> {
		var queryParamsPair = this.sqlBuilder.createSelectByConditions(conditions);
		this.connection.query(
			queryParamsPair.query, 
			queryParamsPair.params, 
			(e: Error, result: any) =>
		{
			if (e) return callback(e);
			if (result.rows.length > 1) return callback(new MoreThenOneResultException(result.rows));
			if (result.rows.length == 0) return callback(null, null);
			var entity = this.converter.fromRow(result.rows[0]);
			callback(null, entity);
		});

		return this;
	}

	removeBy(conditions: any, callback: (e: Error) => void): IManager<Entity, EntityObject, EntityList> {
		var queryParamsPair = this.sqlBuilder.createDeleteByConditions(conditions);
		this.connection.query(
			queryParamsPair.query, 
			queryParamsPair.params, 
			(e: Error, result: any) =>
		{
			if (e) return callback(e);
			callback(null);
		});
		return this;
	}
}
