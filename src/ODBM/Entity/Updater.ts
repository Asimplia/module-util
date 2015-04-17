
import _ = require('underscore');
import EntityMapper = require('../Mapping/EntityMapper');
import PropertyConverter = require('./Property/Converter');
import AnnotationArray = require('../Mapping/Annotation/Array');

export = Updater;
class Updater<Entity, EntityObject> {

	private propertyConverter: PropertyConverter;

	constructor(
		private entityMapper: EntityMapper<Entity, EntityObject>
	) {
		this.propertyConverter = new PropertyConverter();
	}

	set(entity: Entity, key: string, value: any) {
		var objectPropertyName = this.entityMapper.getObjectPropertyName();
		var object = entity[objectPropertyName];
		this.updateObjectValue(value, object, key, [key]);
		return this;
	}

	get(entity: Entity, key: string): any {
		var objectPropertyName = this.entityMapper.getObjectPropertyName();
		var object = entity[objectPropertyName];
		object = this.convertObject(object, []);
		return object[key];
	}

	private convertObject(object: EntityObject, keyPath: string[]): EntityObject {
		var convertedObject = this.updateObject(object, <EntityObject>{}, keyPath);
		return convertedObject;
	}

	updateObject(sourceObject: EntityObject, destinationObject: EntityObject, keyPath: string[]): EntityObject {
		var keys = this.entityMapper.getEmbeddedKeys.apply(this.entityMapper, keyPath);
		keys.forEach((key: string) => {
			var embeddedKeyPath = [].concat(keyPath, [key]);
			try {
				this.updateObjectValue(sourceObject[key], destinationObject, key, embeddedKeyPath);
			} catch (e) {
				e.sourceObject = sourceObject;
				e.destinationObject = destinationObject;
				throw e;
			}
		});
		return destinationObject;
	}

	private updateObjectValue(sourceValue: any, destinationObject: any, key: string, embeddedKeyPath: string[]) {
		var destinationValue: any = destinationObject[key];
		if (this.entityMapper.isEmbeddedByKey.apply(this.entityMapper, embeddedKeyPath)) {
			destinationObject[key] = this.updateObject(
				sourceValue,
				destinationValue || {},
				embeddedKeyPath
			);
		} else {
			var type = this.entityMapper.getPropertyTypeByKey.apply(this.entityMapper, embeddedKeyPath);
			if (type instanceof AnnotationArray && (<AnnotationArray>type).ItemEmbedded) {
				if (!(<AnnotationArray>type).Nullable && !sourceValue) {
					var e: any = new Error('Specified type is not nullable, then should not be null or undefined');
					e.sourceValue = sourceValue;
					e.destinationValue = destinationValue;
					e.embeddedKeyPath = embeddedKeyPath;
					throw e;
				}
				// TODO update Array object instead of replacing with new Array
				destinationObject[key] = sourceValue ? _.map(sourceValue, (itemValue: any, i: number) => {
					return this.updateObject(
						itemValue,
						typeof destinationValue === 'object' && destinationValue[i] ? destinationValue[i] : {},
						[].concat(embeddedKeyPath, ['$type', 'ItemEmbedded'])
					);
				}) : null;
			} else {
				try {
					destinationObject[key] = this.propertyConverter.convertByType(
						type,
						sourceValue
					);
				} catch (e) {
					e.sourceValue = sourceValue;
					e.destinationValue = destinationValue;
					e.embeddedKeyPath = embeddedKeyPath;
					throw e;
				}
			}
		}
	}
}
