
import IManager = require('../IManager');
import IEntityStatic = require('../../Entity/IEntityStatic');
import SqlBuilder = require('./SqlBuilder');
import Converter = require('../../Entity/Converter');
import EntityMapper = require('../../Mapping/EntityMapper');
import Updater = require('../../Entity/Updater');
import List = require('../../Entity/List');

export = Manager;
class Manager<Entity, EntityObject> implements IManager<Entity, EntityObject> {

	private converter: Converter<Entity, EntityObject>;
	private entityMapper: EntityMapper<Entity, EntityObject>;
	private entityUpdater: Updater<Entity, EntityObject>;
	private sqlBuilder: SqlBuilder<Entity>;

	constructor(
		private EntityStatic: IEntityStatic<Entity, EntityObject>,
		private connection: any
	) {
		this.converter = new Converter<Entity, EntityObject>(EntityStatic);
		this.entityMapper = new EntityMapper<Entity, EntityObject>(EntityStatic);
		this.entityUpdater = new Updater<Entity, EntityObject>(this.entityMapper);
		this.sqlBuilder = new SqlBuilder<Entity>(this.converter, this.entityMapper);
	}
	
	insert(entity: Entity, callback: (e: Error, entity?: Entity) => void): IManager<Entity, EntityObject> {
		this.insertList(new List<Entity>([entity]), (e: Error, entityList?: List<Entity>) => {
			if (e) return callback(e);
			callback(null, entityList.first());
		});
		return this;
	}

	insertList(entityList: List<Entity>, callback: (e: Error, entityList?: List<Entity>) => void): IManager<Entity, EntityObject> {
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
			if (e) {
				callback(e);
				return;
			}
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
}
