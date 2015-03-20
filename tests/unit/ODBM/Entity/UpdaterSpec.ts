
import Updater = require('../../../../src/ODBM/Entity/Updater');
import EntityMapper = require('../../../../src/ODBM/Mapping/EntityMapper');
import My = require('../../fixtures/My');
import MyEntity = My.MyEntity;
import IMyEntityObject = My.IMyEntityObject;

describe('ODBM.Entity.Updater', () => {
	var entityMapper = new EntityMapper<MyEntity, IMyEntityObject>(MyEntity);
	var updater = new Updater<MyEntity, IMyEntityObject>(entityMapper);

	describe('get', () => {
		var d1 = new Date();
		it('should get proper value of entity object', () => {
			var entity = new MyEntity({
				id: 113,
				name: 'Hello',
				embedded: {
					description: 'World',
					createdAt: d1
				}
			});
			expect(updater.get(entity, 'id')).toBe(113);
			expect(updater.get(entity, 'name')).toBe('Hello');
			expect(updater.get(entity, 'embedded')).toEqual({
				description: 'World',
				createdAt: d1
			});
		});
	});

	describe('set', () => {

		it('should get proper value of entity object', () => {
			var entity = new MyEntity({
				id: 113,
				name: 'Hello',
				embedded: {
					description: 'World',
					createdAt: new Date()
				}
			});
			updater.set(entity, 'id', 114);
			expect(entity.Object.id).toBe(114);
			updater.set(entity, 'name', 'Hi');
			expect(entity.Object.name).toBe('Hi');
			var d2 = new Date();
			updater.set(entity, 'embedded', { description: 'City', createdAt: d2 });
			expect(entity.Object.embedded).toEqual({
				description: 'City',
				createdAt: d2
			});
		});
	});
});
