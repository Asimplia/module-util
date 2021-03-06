
import each = require('each');
import _ = require('underscore');
import CommonItemList = require('./CommonItemList');

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
			array.push(objectFactory(item));
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

	mapList<MappedItem, MappedItemList extends CommonItemList>(cb: (item: Item) => MappedItem) {
		return new List<MappedItem, MappedItemList>(_.map(this.items, cb));
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

	restList(n: number): ItemList {
		return new this.ListStatic(_.rest(this.items, n));
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

	merge(mergeList: ItemList) {
		return new this.ListStatic([].concat(this.items, mergeList.toArray()));
	}

	add(item: Item) {
		var items = [].concat(this.items);
		items.push(item);
		return new this.ListStatic(items);
	}

	remove(item: Item) {
		var items = [].concat(this.items);
		var i = items.indexOf(item);
		if (i !== -1) {
			items.splice(i, 1);
		}
		return new this.ListStatic(items);
	}

	contains(item: Item) {
		return _.contains(this.items, item);
	}

	flatMap(cb: (item: Item) => any) {
		return new List<any, CommonItemList>(_.flatten(this.map(cb).toArray()));
	}

	flatten() {
		return new List<any, CommonItemList>(_.flatten(this.toArray()));
	}

	unique() {
		return new List<any, CommonItemList>(_.unique(this.toArray()));
	}

	groupBy(cb: (item: Item) => any) {
		var groups = _.groupBy(this.items, cb);
		return new List<ItemList, List<ItemList, any>>(_.map(_.toArray(groups), (items: Item[]) => {
			return new this.ListStatic(items);
		}));
	}
}
