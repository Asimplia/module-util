
import each = require('each');
import _ = require('underscore');

type CommonItemList = List<any, any>;

export = List;
class List<Item, ItemList extends CommonItemList> {

	private indexedBy: {[propertyName: string]: {[index: string]: Item} } = {};

	constructor(
		protected items: Item[],
		private ListStatic: new(items: Item[]) => ItemList = <any>List
	) {}

	toArray(objectFactory?: (item: Item) => any) {
		if (typeof objectFactory === 'undefined') {
			objectFactory = (item: Item) => { return item; };
		}
		var array = [];
		this.items.forEach((item: Item) => {
			try {
				array.push(objectFactory(item));
			} catch (e) {
				console.warn('Item was deleted from array becouse error happened during create object', item, e);
			}
		});
		return array;
	}

	filter(cb: (item: Item) => boolean) {
		return new this.ListStatic(_.filter(this.items, cb));
	}

	find(cb: (item: Item) => boolean): Item {
		return _.find(this.items, cb);
	}

	findOneOnly(cb: (item: Item) => boolean): Item {
		if (this.filter(cb).count() > 1) {
			throw new Error('More items found');
		}
		return this.find(cb);
	}

	any(cb: (item: Item) => boolean): boolean {
		return _.any(this.items, cb);
	}

	map(cb: (item: Item) => any) {
		return new List<any, CommonItemList>(_.map(this.items, cb));
	}

	max(cb: (item: Item) => number) {
		return _.max(this.items, cb);
	}

	sortBy(cb: (item: Item) => number) {
		return new this.ListStatic(_.sortBy(this.items, cb));
	}

	getListByMax(cb: (item: Item) => number): ItemList {
		var maxItem = this.max(cb);
		return this.filter((item: Item) => {
			return cb(item) == cb(maxItem);
		});
	}

	all(cb: (item: Item) => boolean): boolean {
		return _.all(this.items, cb);
	}

	forEach(cb: (item: Item, i?: number) => any) {
		this.items.forEach(cb);
		return this;
	}

	count(): number {
		return this.items.length;
	}

	isEmpty(): boolean {
		return this.count() == 0;
	}

	first(): Item {
		return this.items[0];
	}

	last(): Item {
		return this.items[this.items.length - 1];
	}

	firstList(n: number): ItemList {
		return new this.ListStatic(_.first(this.items, n));
	}

	createEach() {
		return each(this.items);
	}

	indexBy(propertyName: string) {
		if (typeof this.indexedBy[propertyName] === 'undefined') {
			this.indexedBy[propertyName] = {};
			this.forEach((item: Item) => {
				this.indexedBy[propertyName][item[propertyName]] = item;
			});
		}
		return this.indexedBy[propertyName];
	}

	index(cb: (item: Item) => string|number) {
		return _.indexBy(this.items, cb);
	}

	get(i: number) {
		return this.items[i];
	}

	chunk(batchLength: number): ItemList[] {
		var batches = _.groupBy(this.items, (item: Item, index: number) => {
			return Math.floor(index / batchLength);
		});
		return _.map(_.toArray(batches), (items: Item[]) => {
			return new this.ListStatic(items);
		});
	}
}
