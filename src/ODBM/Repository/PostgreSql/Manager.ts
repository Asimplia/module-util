
import IManager = require('../IManager');
import IEntityStatic = require('../../Entity/IEntityStatic');
import IEntityListStatic = require('../../Entity/IEntityListStatic');
import SqlBuilder = require('./SqlBuilder');
import Converter = require('../../Entity/Converter');
import EntityMapper = require('../../Mapping/EntityMapper');
import Updater = require('../../Entity/Updater');
import List = require('../../Entity/List');

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
		var queryParamsPair = this.sqlBuilder.createInsertList(entityList);
		this.connection.query(
			queryParamsPair.query, 
			queryParamsPair.params, 
			(e: Error, result: any) =>
		{
			if (e) return callback(e);
			result.rows.forEach((row: any, i: number) => {
				var entity = entityList.get(i);
				this.entityUpdater.set(
					entity,
					this.entityMapper.getIdKey(), 
					row[this.entityMapper.getIdName()]
				);
			});
			callback(null, entityList);
		});

		return this;
	}

	getListBy(conditions: any, callback: (e: Error, entityList?: EntityList) => void): IManager<Entity, EntityObject, EntityList> {
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
