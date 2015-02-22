
import IQueryParamsPair = require('./IQueryParamsPair');
import Converter = require('../../Entity/Converter');
import EntityMapper = require('../../Mapping/EntityMapper');
import Id = require('../../Mapping/Annotation/Id');
import List = require('../../Entity/List');

export = SqlBuilder;
class SqlBuilder<Entity> {

	constructor(
		private converter: Converter<Entity, any>,
		private entityMapper: EntityMapper<Entity, any>
	) {}
	
	createInsertList(entityList: List<Entity>): IQueryParamsPair {
		var params = [];
		var placeholderRows = [];
		var placeholderIndex = 0;
		entityList.forEach((entity: Entity) => {
			var placeholders = [];
			var object = this.converter.toObject(entity);
			var entityKeys = this.entityMapper.getKeys();
			_.each(entityKeys, (key: string) => {
				var value = object[key];
				if (this.entityMapper.getTypeByKey(key) instanceof Id && this.isEmpty(value)) {
					placeholders.push('DEFAULT');
				} else {
					placeholderIndex++;
					params.push(value);
					placeholders.push('$' + placeholderIndex);
				}
			});
			placeholderRows.push(placeholders.join(','));
		});
		var columns = this.entityMapper.getPropertyNames();
		var sql = "INSERT INTO " + this.entityMapper.getName()
			+ ' (' + columns.join(',') + ') '
			+ 'VALUES (' + placeholderRows.join('),(') + ') '
			+ 'RETURNING ' + this.entityMapper.getIdName();
		return {
			query: sql,
			params: params
		};
	}

	private isEmpty(value: any) {
		return value === null || typeof value === 'undefined';
	}
}
