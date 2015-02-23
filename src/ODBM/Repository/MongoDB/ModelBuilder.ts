
import mongoose = require('mongoose');
import Schema = mongoose.Schema;
import EntityMapper = require('../../Mapping/EntityMapper');
import Type = require('../../Mapping/Annotation/Type');
import AnnotationBoolean = require('../../Mapping/Annotation/Boolean');
import AnnotationDate = require('../../Mapping/Annotation/Date');
import AnnotationId = require('../../Mapping/Annotation/Id');
import AnnotationInteger = require('../../Mapping/Annotation/Integer');
import AnnotationString = require('../../Mapping/Annotation/String');

export = ModelBuilder;
class ModelBuilder<Entity, EntityObject> {

	private static cachedModel: {[modelName: string]: mongoose.Model<mongoose.Document>} = {};

	constructor(
		private entityMapper: EntityMapper<Entity, EntityObject>
	) {}
	
	create(): mongoose.Model<mongoose.Document> {
		var modelName = this.entityMapper.getName();
		if (typeof ModelBuilder.cachedModel[modelName] === 'undefined') {
			var definition = this.getEmbeddedDefinition([]);
			var schema = new Schema(definition);
			var Model = mongoose.model(modelName, schema);
			ModelBuilder.cachedModel[modelName] = Model;
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
			if (this.entityMapper.isEmbeddedByKey.apply(this.entityMapper, keyPath)) {
				var propertyDefinition = this.getEmbeddedDefinition(keyPath);
			} else {
				var type = this.entityMapper.getPropertyTypeByKey.apply(this.entityMapper, keyPath);
				var propertyDefinition = this.getDefinitionByType(type);
			}
			definition[name] = propertyDefinition;
		});
		return definition;
	}

	private getDefinitionByType(type: Type) {
		switch (true) {
			case type instanceof AnnotationBoolean:
				return Boolean;
			case type instanceof AnnotationDate:
				return Date;
			case type instanceof AnnotationId:
				return this.getDefinitionByType((<AnnotationId>type).Type);
			case type instanceof AnnotationInteger:
				return Number;
			case type instanceof AnnotationString:
				return String;
		}
		throw new Error('Specified Type ' + (<any>type).constructor.name + ' is not implemented');
	}
}
