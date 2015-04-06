
import hash = require('object-hash');

export = GetterCache;
class GetterCache {

	private static HASH_KEY = '$.__GetterCache__.HASH_KEY';

	register<Cached>(classFunction: new(...args: any[]) => Cached, propertyNames: string[]) {
		if (classFunction[GetterCache.HASH_KEY]) {
			return;
		}
		this.getHash(classFunction);
		var getHash = (object: Cached) => this.getHash(object);
		var defaultDescriptors: {[propertyName: string]: PropertyDescriptor} = {};
		var objectNotInvalid: {[objectHash: string]: boolean} = {};
		var objectCache: {[objectHash: string]: {[propertyName: string]: any}} = {};
		propertyNames.forEach((propertyName: string) => {
			var descriptor = Object.getOwnPropertyDescriptor(classFunction.prototype, propertyName);
			if (typeof descriptor !== 'undefined') {
				defaultDescriptors[propertyName] = {
					get: descriptor.get,
					set: descriptor.set,
					enumerable: descriptor.enumerable,
					configurable: descriptor.configurable,
					writable: descriptor.writable,
					value: descriptor.value
				};
				var newDescriptor: PropertyDescriptor = {};
				if (descriptor.enumerable) newDescriptor.enumerable = descriptor.enumerable;
				if (descriptor.configurable) newDescriptor.configurable = descriptor.configurable;
				if (descriptor.writable) newDescriptor.writable = descriptor.writable;
				if (descriptor.value) newDescriptor.value = descriptor.value;

				if (typeof defaultDescriptors[propertyName].get !== 'undefined') {
					newDescriptor.get = function () {
						var objectHash = getHash(this);
						if (typeof objectCache[objectHash] === 'undefined') {
							objectCache[objectHash] = {};
						}
						if (objectNotInvalid[objectHash]) {
							var newValue = defaultDescriptors[propertyName].get.call(this);
							objectCache[objectHash][propertyName] = newValue;
							objectNotInvalid[objectHash] = true;
						}
						return objectCache[objectHash][propertyName];
					};
				}
				if (typeof defaultDescriptors[propertyName].set !== 'undefined') { // TODO all set & methods call
					newDescriptor.set = function (newValue: any) {
						var objectHash = getHash(this);
						objectNotInvalid[objectHash] = false;
						if (typeof defaultDescriptors[propertyName].set !== 'undefined') {
							defaultDescriptors[propertyName].set.call(this, newValue);
						} else {
							this[propertyName] = newValue;
						}
					};
				}
				if (newDescriptor.get || newDescriptor.set) {
					Object.defineProperty(classFunction.prototype, propertyName, newDescriptor);
				}
			}
		});
	}

	private getHash(object: any) {
		if (typeof object[GetterCache.HASH_KEY] === 'undefined') {
			object[GetterCache.HASH_KEY] = hash(object);
		}
		return object[GetterCache.HASH_KEY];
	}
}
