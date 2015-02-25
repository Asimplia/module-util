
import _ = require('underscore');
import moment = require('moment');
import IQueryParamsPair = require('./IQueryParamsPair');
import Converter = require('../../Entity/Converter');
import EntityMapper = require('../../Mapping/EntityMapper');
import Id = require('../../Mapping/Annotation/Id');
import List = require('../../Entity/List');
import IConditions = require('./IConditions');
import IComparableConditions = require('./IComparableConditions');

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
			entityKeys.forEach((key: string) => {
				var value = object[key];
				if (this.entityMapper.getPropertyTypeByKey(key) instanceof Id && this.isEmpty(value)) {
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

	createSelectByConditions(conditions: IConditions): IQueryParamsPair {
		var tableName = this.entityMapper.getName();
		var where = this.getWhereByConditions(conditions);
		var sql = 'SELECT ' + this.getAliasedColumnNames().join(', ') + ' '
			+ ' FROM ' + tableName + ' '
			+ ' WHERE ' + where.query;
		return {
			query: sql,
			params: where.params
		};
	}

	createDeleteByConditions(conditions: IConditions): IQueryParamsPair {
		var tableName = this.entityMapper.getName();
		var where = this.getWhereByConditions(conditions);
		var sql = 'DELETE FROM ' + tableName + ' '
			+ ' WHERE ' + where.query;
		return {
			query: sql,
			params: where.params
		};
	}

	private getAliasedColumnNames(): string[] {
		var keys = this.entityMapper.getKeys();
		return _.map(keys, (key: string) => {
			return this.getFullColumnName(key)
				+ ' AS "' + this.getColumnNameAlias(key) + '"';
		});
	}

	private getFullColumnName(key: string): string {
		var tableName = this.entityMapper.getName();
		var columnName = this.entityMapper.getPropertyNameByKey(key);
		return tableName + '.' + columnName;
	}

	private getColumnNameAlias(key: string): string {
		var columnName = this.entityMapper.getPropertyNameByKey(key);
		return columnName;
	}

	private isEmpty(value: any) {
		return value === null || typeof value === 'undefined';
	}

	private getWhereByConditions(conditions: IConditions): IQueryParamsPair {
		var params = [];
		var whereParts = [];
		var placeholderIndex = 0;
		_.each(Object.keys(conditions), (key: string) => {
			var value = conditions[key];
			var column = this.entityMapper.getPropertyNameByKey(key);
			if (typeof value === 'object') {
				var comparableConditions: IComparableConditions = value;
				if (typeof comparableConditions.$gt !== 'undefined' && comparableConditions.$gt !== null) {
					placeholderIndex++;
					whereParts.push(' ' + column + ' > $' + placeholderIndex) + ' ';
					params.push(this.prepareValue(comparableConditions.$gt));
				}
				if (typeof comparableConditions.$lt !== 'undefined' && comparableConditions.$lt !== null) {
					placeholderIndex++;
					whereParts.push(' ' + column + ' < $' + placeholderIndex) + ' ';
					params.push(this.prepareValue(comparableConditions.$lt));
				}
				if (typeof comparableConditions.$gte !== 'undefined' && comparableConditions.$gte !== null) {
					placeholderIndex++;
					whereParts.push(' ' + column + ' >= $' + placeholderIndex) + ' ';
					params.push(this.prepareValue(comparableConditions.$gte));
				}
				if (typeof comparableConditions.$lte !== 'undefined' && comparableConditions.$lte !== null) {
					placeholderIndex++;
					whereParts.push(' ' + column + ' <= $' + placeholderIndex) + ' ';
					params.push(this.prepareValue(comparableConditions.$lte));
				}
			} else {
				placeholderIndex++;
				whereParts.push(' ' + column + ' = $' + placeholderIndex) + ' ';
				params.push(this.prepareValue(value));
			}
		});
		return {
			query: whereParts.length ? whereParts.join(' AND ') : 'TRUE',
			params: params
		};
	}

	private prepareValue(value: any) {
		if (value instanceof Date) {
			return this.formatDate(moment(value).toDate());
		}
		return value;
	}

	private formatDate(value: Date): string {
		return moment(value).format('YYYY-MM-DD\\THH:mm:ss.SSSZZ');
	}
}