
import ModelBuilder = require('../../../../../src/ODBM/Repository/MongoDB/ModelBuilder');
import EntityMapper = require('../../../../../src/ODBM/Mapping/EntityMapper');
import My = require('../../../fixtures/My');
import MyEntity = My.MyEntity;
import MyEntityObject = My.MyEntityObject;

describe('ODBM.Repository.MongoDB.ModelBuilder', () => {
	var entityMapper = new EntityMapper<MyEntity, MyEntityObject>(MyEntity);
	var connectionMock = <any>{};
	var modelBuilder = new ModelBuilder<MyEntity, MyEntityObject>(entityMapper, connectionMock);

	describe('getEmbeddedDefinition', () => {
		var definition = (<any>modelBuilder).getEmbeddedDefinition([]); // test private, becouse create is depend on mongoose
		expect(definition).toEqual({
			id: Number,
			entity_name: String,
			embedded: {
				description: String,
				created_at: Date
			}
		});
	});

});
