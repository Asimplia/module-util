
import each = require('each');
import _ = require('underscore');

export = List;
class List<Entity> {
	private entities: Entity[] = [];
	private indexedBy: {[propertyName: string]: {[index: string]: Entity} } = {};

	constructor(items?: any[], entityFactory?: (o: any) => Entity) {
		if (typeof items !== 'undefined') {
			this.pushArray(items, entityFactory);
		}
	}

	pushArray(items: any[], entityFactory?: (o: any) => Entity) {
		if (typeof entityFactory === 'undefined') {
			entityFactory = (entity: Entity) => { return entity; };
		}
		if (!items) {
			return this;
		}
		items.forEach((item) => {
			try {
				this.entities.push(entityFactory(item));
			} catch (e) {
				console.warn('Entity was deleted from List becouse error happened during create entity', item, e);
			}
		});
		return this;
	}

	push(item: Entity): List<Entity> {
		this.entities.push(item);
		return this;
	}

	remove(item: Entity): void {
		var i = _.indexOf(this.entities, item);
		if (i === null) {
			throw new Error('Item ' + item + ' not exists in List');
		}
		this.entities.splice(i, 1);
	}

	toArray(objectFactory?: (entity: Entity) => any) {
		if (typeof objectFactory === 'undefined') {
			objectFactory = (entity: Entity) => { return entity; };
		}
		var array = [];
		this.entities.forEach((entity: Entity) => {
			try {
				array.push(objectFactory(entity));
			} catch (e) {
				console.warn('Entity was deleted from array becouse error happened during create object', entity, e);
			}
		});
		return array;
	}

	filter(cb: (entity: Entity) => boolean) {
		return new List<Entity>(_.filter(this.entities, cb), this.returnValue);
	}

	find(cb: (entity: Entity) => boolean): Entity {
		return _.find(this.entities, cb);
	}

	findOneOnly(cb: (entity: Entity) => boolean): Entity {
		if (this.filter(cb).count() > 1) {
			throw new Error('More items found');
		}
		return this.find(cb);
	}

	any(cb: (entity: Entity) => boolean): boolean {
		return _.any(this.entities, cb);
	}

	map(cb: (entity: Entity) => any) {
		return new List<any>(_.map(this.entities, cb), this.returnValue);
	}

	max(cb: (entity: Entity) => number) {
		return _.max(this.entities, cb);
	}

	sortBy(cb: (entity: Entity) => number) {
		return new List<Entity>(_.sortBy(this.entities, cb), this.returnValue);
	}

	getListByMax(cb: (entity: Entity) => number): List<Entity> {
		var maxEntity = this.max(cb);
		return this.filter((entity: Entity) => {
			return cb(entity) == cb(maxEntity);
		});
	}

	all(cb: (entity: Entity) => boolean): boolean {
		return _.all(this.entities, cb);
	}

	forEach(cb: (entity: Entity, i?: number) => any) {
		this.entities.forEach(cb);
		return this;
	}

	count(): number {
		return this.entities.length;
	}

	isEmpty(): boolean {
		return this.count() == 0;
	}

	first(): Entity {
		return this.entities[0];
	}

	last(): Entity {
		return this.entities[this.entities.length - 1];
	}

	firstList(n: number): List<Entity> {
		return new List<Entity>(_.first(this.entities, n), this.returnValue);
	}

	createEach() {
		return each(this.entities);
	}

	indexBy(propertyName: string) {
		if (typeof this.indexedBy[propertyName] === 'undefined') {
			this.indexedBy[propertyName] = {};
			this.forEach((entity: Entity) => {
				this.indexedBy[propertyName][entity[propertyName]] = entity;
			});
		}
		return this.indexedBy[propertyName];
	}

	get(i: number) {
		return this.entities[i];
	}

	private returnValue(entity: Entity) {
		return entity;
	}
}
