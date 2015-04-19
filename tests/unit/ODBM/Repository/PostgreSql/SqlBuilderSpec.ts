
import List = require('../../../../../src/ODBM/Entity/List');
import Converter = require('../../../../../src/ODBM/Entity/Converter');
import EntityMapper = require('../../../../../src/ODBM/Mapping/EntityMapper');
import SqlBuilder = require('../../../../../src/ODBM/Repository/PostgreSql/SqlBuilder');
import My = require('../../../fixtures/My');

describe('ODBM.Repository.PostgreSql.SqlBuilder', () => {
	var converter = new Converter<My.PlainEntity, My.IPlainEntityObject>(My.PlainEntity);
	var mapper = new EntityMapper<My.PlainEntity, My.IPlainEntityObject>(My.PlainEntity);
	var sqlBuilder = new SqlBuilder<My.PlainEntity>(converter, mapper);
	describe('createUpdateList', () => {
		it('should create query for update more rows by entityList', () => {
			var list = new List<My.PlainEntity>([
				new My.PlainEntity({
					id: 1,
					name: 'Michael',
					type: 'man'
				}),
				new My.PlainEntity({
					id: 1,
					name: 'Kate',
					type: 'women'
				}),
			]);
			var queryParamsPair = sqlBuilder.createUpdateList(list);
			expect(queryParamsPair.params).toEqual([
				1, 'Michael', 'man',
				1, 'Kate', 'women'
			]);
			/* tslint:disable:max-line-length */
			expect(queryParamsPair.query).toBe(
				'UPDATE plain_entity SET id = source.id,entity_name = source.entity_name,entity_type = source.entity_type FROM (VALUES ($1,$2,$3),($4,$5,$6)) AS source (id,entity_name,entity_type) WHERE plain_entity.id = source.id'
			);
			/* tslint:enable */
		});
	});
});
