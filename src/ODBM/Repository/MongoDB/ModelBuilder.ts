
import mongoose = require('mongoose'); // only for typing
import EntityMapper = require('../../Mapping/EntityMapper');
import Type = require('../../Mapping/Annotation/Type');
import AnnotationBoolean = require('../../Mapping/Annotation/Boolean');
import AnnotationDate = require('../../Mapping/Annotation/Date');
import AnnotationId = require('../../Mapping/Annotation/Id');
import AnnotationInteger = require('../../Mapping/Annotation/Integer');
import AnnotationFloat = require('../../Mapping/Annotation/Float');
import AnnotationString = require('../../Mapping/Annotation/String');
import AnnotationArray = require('../../Mapping/Annotation/Array');
import IEmbeddedAnnotation = require('../../Entity/Annotation/IEmbeddedAnnotation');

// should be in mongoose.d.ts, but missing now
/* tslint:disable */
interface IMongooseSchemableMongoose extends mongoose.Mongoose {
	Schema: new (...args: any[]) => mongoose.Schema;
}
/* tslint:enable */

export = ModelBuilder;
class ModelBuilder<Entity, EntityObject> {

	private static cachedModel: {[modelName: string]: mongoose.Model<mongoose.Document>} = {};

	constructor(
		private entityMapper: EntityMapper<Entity, EntityObject>,
		private connection: mongoose.Mongoose
	) {}

	create(): mongoose.Model<mongoose.Document> {
		var modelName = this.entityMapper.getName();
		if (typeof ModelBuilder.cachedModel[modelName] === 'undefined') {
			var definition = this.getEmbeddedDefinition([]);
			var schema = new (<IMongooseSchemableMongoose>this.connection).Schema(definition);
			var model = this.connection.model(modelName, schema);
			ModelBuilder.cachedModel[modelName] = model;
		}
		return ModelBuilder.cachedModel[modelName];
	}

	private getEmbeddedDefinition(embeddedKeys: string[]) {
		var definition: any = {};
		var keys = this.entityMapper.getEmbeddedKeys.apply(
			this.entityMapper,
			embeddedKeys
		);
		keys.forEach((key: string) => {
			var keyPath = [].concat(embeddedKeys, [key]);
			var name = this.entityMapper.getPropertyNameByKey.apply(this.entityMapper, keyPath);
			var propertyDefinition;
			if (this.entityMapper.isEmbeddedByKey.apply(this.entityMapper, keyPath)) {
				propertyDefinition = this.getEmbeddedDefinition(keyPath);
			} else {
				var type = this.entityMapper.getPropertyTypeByKey.apply(this.entityMapper, keyPath);
				propertyDefinition = this.getDefinitionByType(type, keyPath);
			}
			definition[name] = propertyDefinition;
		});
		return definition;
	}

	private getDefinitionByType(type: Type, keyPath: string[]): any {
		switch (true) {
			case type instanceof AnnotationBoolean:
				return Boolean;
			case type instanceof AnnotationDate:
				return Date;
			case type instanceof AnnotationId:
				var definition: any = {
					type: this.getDefinitionByType((<AnnotationId>type).Type, keyPath),
					unique: true
				};
				var parentKeyPath = keyPath.slice(0, keyPath.length - 1);
				var parentAnnotation: IEmbeddedAnnotation = this.entityMapper.getAnnotationByKey.apply(this.entityMapper, parentKeyPath);
				if (parentAnnotation.$nullable) {
					definition.sparse = true;
				}
				return definition;
			case type instanceof AnnotationInteger:
			case type instanceof AnnotationFloat:
				return Number;
			case type instanceof AnnotationString:
				return String;
			case type instanceof AnnotationArray:
				var arrayType = (<AnnotationArray>type);
				return [
					arrayType.ItemEmbedded
					? this.getEmbeddedDefinition([].concat(keyPath, ['$type', 'ItemEmbedded']))
					: this.getDefinitionByType(arrayType.ItemType, keyPath)
				];
		}
		throw new Error('Specified Type ' + (<any>type).constructor.name + ' is not implemented');
	}
}
