/* tslint:disable:no-unused-variable */
import Converter = require('../../../../src/ODBM/Entity/Converter');
import My = require('../../fixtures/My');
import MyEntity = My.MyEntity;
import IMyEntityObject = My.IMyEntityObject;

describe('ODBM.Entity.Converter', () => {
	var converter = new Converter<MyEntity, IMyEntityObject>(MyEntity);

	describe('fromObject', () => {
		it('should return entity with object inside', () => {
			var object = {
				id: 113,
				name: 'Hello',
				embedded: {
					description: 'World',
					createdAt: new Date()
				},
				arrayEmbedded: [
					{
						coolness: 10
					},
					{
						coolness: 0
					}
				],
				array: ['any', 'some']
			};
			var entity = converter.fromObject(object);
			expect(entity.Object).toEqual(object);
		});

		it('should return entity with proper converted values', () => {
			var object = {
				id: '113',
				name: 432,
				embedded: {
					description: true,
					createdAt: 'Mon Feb 23 2015 09:22:39 GMT+0100 (CET)'
				},
				arrayEmbedded: [
					{
						coolness: 10
					},
					{
						coolness: 0
					}
				],
				array: ['any', 'some']
			};
			var entity = converter.fromObject(<any>object);
			var expectedObject = {
				id: 113,
				name: '432',
				embedded: {
					description: 'true',
					createdAt: new Date('Mon Feb 23 2015 09:22:39 GMT+0100 (CET)')
				},
				arrayEmbedded: [
					{
						coolness: 10
					},
					{
						coolness: 0
					}
				],
				array: ['any', 'some']
			};
			expect(entity.Object).toEqual(expectedObject);
		});
	});

	describe('toObject', () => {
		it('should return object of entity inside', () => {
			var entity = new MyEntity({
				id: 113,
				name: 'Hello',
				embedded: {
					description: 'World',
					createdAt: new Date()
				},
				arrayEmbedded: [
					{
						coolness: 10
					},
					{
						coolness: 0
					}
				],
				array: ['any', 'some']
			});
			var object = converter.toObject(entity);
			expect(object).toEqual(entity.Object);
		});

		it('should return entity with proper converted values', () => {
			var entity = new MyEntity(<any>{
				id: '113',
				name: 432,
				embedded: {
					description: true,
					createdAt: 'Mon Feb 23 2015 09:22:39 GMT+0100 (CET)'
				},
				arrayEmbedded: [
					{
						coolness: '10'
					},
					{
						coolness: 0
					}
				],
				array: ['any', 1]
			});
			var object = converter.toObject(entity);
			var expectedObject = {
				id: 113,
				name: '432',
				embedded: {
					description: 'true',
					createdAt: new Date('Mon Feb 23 2015 09:22:39 GMT+0100 (CET)')
				},
				arrayEmbedded: [
					{
						coolness: 10
					},
					{
						coolness: 0
					}
				],
				array: ['any', '1']
			};
			expect(object).toEqual(expectedObject);
		});
	});

	describe('fromRow', () => {
		it('should return entity with proper values by row', () => {
			var row = {
				id: '113',
				entity_name: 432,
				embedded: {
					description: true,
					created_at: 'Mon Feb 23 2015 09:22:39 GMT+0100 (CET)'
				},
				arrayEmbedded: [
					{
						coolness: '10'
					},
					{
						coolness: 0
					}
				],
				array: ['any', 'some']
			};
			var entity = converter.fromRow(row);
			var expectedObject = {
				id: 113,
				name: '432',
				embedded: {
					description: 'true',
					createdAt: new Date('Mon Feb 23 2015 09:22:39 GMT+0100 (CET)')
				},
				arrayEmbedded: [
					{
						coolness: 10
					},
					{
						coolness: 0
					}
				],
				array: ['any', 'some']
			};
			expect(entity.Object).toEqual(expectedObject);
		});
	});

	describe('toRow', () => {
		it('should return row of entity with proper values in object', () => {
			var entity = new MyEntity(<any>{
				id: '113',
				name: 432,
				embedded: {
					description: true,
					createdAt: 'Mon Feb 23 2015 09:22:39 GMT+0100 (CET)'
				},
				arrayEmbedded: [
					{
						coolness: 10
					},
					{
						coolness: 0
					}
				],
				array: ['any', 'some']
			});
			var row = converter.toRow(entity);
			var expectedRow = {
				id: 113,
				entity_name: '432',
				embedded: {
					description: 'true',
					created_at: new Date('Mon Feb 23 2015 09:22:39 GMT+0100 (CET)')
				},
				arrayEmbedded: [
					{
						coolness: 10
					},
					{
						coolness: 0
					}
				],
				array: ['any', 'some']
			};
			expect(row).toEqual(expectedRow);
		});
	});
});
