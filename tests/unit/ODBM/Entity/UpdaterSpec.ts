
import Updater = require('../../../../src/ODBM/Entity/Updater');
import EntityMapper = require('../../../../src/ODBM/Mapping/EntityMapper');
import My = require('../../fixtures/My');
import MyEntity = My.MyEntity;
import MyEntityObject = My.MyEntityObject;

describe('ODBM.Entity.Updater', () => {
	var entityMapper = new EntityMapper<MyEntity, MyEntityObject>(MyEntity);
	var updater = new Updater<MyEntity, MyEntityObject>(entityMapper);

	describe('get', () => {

		it('should get proper value of entity object', () => {
			var entity = new MyEntity({
				id: 113,
				name: 'Hello',
				embedded: {
					description: 'World',
					createdAt: new Date()
				}
			});
			expect(updater.get(entity, 'id')).toBe(113);
			expect(updater.get(entity, 'name')).toBe('Hello');
			expect(updater.get(entity, 'embedded')).toEqual({
				description: 'World',
				createdAt: new Date()
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
			updater.set(entity, 'id', 114)
			expect(entity.Object.id).toBe(114);
			updater.set(entity, 'name', 'Hi')
			expect(entity.Object.name).toBe('Hi');
			var d2 = new Date();
			updater.set(entity, 'embedded', { description: 'City', createdAt: d2 })
			expect(entity.Object.embedded).toEqual({
				description: 'City',
				createdAt: d2
			});
		});
	});
});