/* tslint:disable:no-unused-variable */
import ModelBuilder = require('../../../../../src/ODBM/Repository/MongoDB/ModelBuilder');
import EntityMapper = require('../../../../../src/ODBM/Mapping/EntityMapper');
import My = require('../../../fixtures/My');
import MyEntity = My.MyEntity;
import IMyEntityObject = My.IMyEntityObject;

describe('ODBM.Repository.MongoDB.ModelBuilder', () => {
	var entityMapper = new EntityMapper<MyEntity, IMyEntityObject>(MyEntity);
	var connectionMock = <any>{};
	var modelBuilder = new ModelBuilder<MyEntity, IMyEntityObject>(entityMapper, connectionMock);

	describe('getEmbeddedDefinition', () => {
		var definition = (<any>modelBuilder).getEmbeddedDefinition([]); // test private, becouse create is depend on mongoose
		it('should return right model definition', () => {
			expect(definition).toEqual({
				id: { type: Number, unique: true },
				entity_name: String,
				embedded: {
					description: String,
					created_at: Date
				},
				arrayEmbedded: [{
					coolness: Number
				}],
				array: [String],
				nullableArray: [String]
			});
		});
	});

});
