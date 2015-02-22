
import _ = require('underscore');
import IEntityStatic = require('../Entity/IEntityStatic');
import Id = require('./Annotation/Id');
import Type = require('./Annotation/Type');
import ITypeStatic = require('./Annotation/ITypeStatic');
import IPropertyAnnotation = require('../Entity/Annotation/IPropertyAnnotation');
import DatabaseSystem = require('../DBS/DatabaseSystem');
import AnnotationNormalizer = require('./AnnotationNormalizer');

export = EntityMapper;
class EntityMapper<Entity, EntityObject> {
	
	constructor(
		private EntityStatic: IEntityStatic<Entity, EntityObject>
	) {
		var annotationNormalizer = new AnnotationNormalizer<Entity, EntityObject>(EntityStatic);
		annotationNormalizer.normalizeEntityAnnotations();
	}

	getIdKey(): string {
		var entityAnnotation = this.EntityStatic.$entity;
		var idKey = _.find(this.getKeys(), (key: string) => {
			return (<IPropertyAnnotation>entityAnnotation[key]).$type instanceof Id;
		});
		if (!idKey) {
			throw new Error('Id property is not defined');
		}
		return idKey;
	}

	getIdAnnotation(): IPropertyAnnotation {
		var idKey = this.getIdKey();
		return <IPropertyAnnotation>this.EntityStatic.$entity[idKey];
	}

	getIdName(): string {
		var annotation = this.getIdAnnotation();
		return annotation.$name;
	}

	getKeys(): string[] {
		var entityAnnotation = this.EntityStatic.$entity;
		var annotationKeys = Object.keys(entityAnnotation);
		return _.filter(annotationKeys, (annotationKey: string) => {
			return this.isPropertyAnnotation(entityAnnotation[annotationKey]);
		});
	}

	getPropertyNameByKey(key: string): string {
		var propertyAnnotation = this.getPropertyAnnotationByKey(key);
		return propertyAnnotation.$name;
	}

	getPropertyTypeByKey(key: string): Type {
		var propertyAnnotation = this.getPropertyAnnotationByKey(key);
		return <Type>propertyAnnotation.$type;
	}

	getPropertyAnnotationByKey(key: string): IPropertyAnnotation {
		var entityAnnotation = this.EntityStatic.$entity;
		var propertyAnnotation = entityAnnotation[key];
		if (!this.isPropertyAnnotation(propertyAnnotation)) {
			throw new Error('Getting key is not IPropertyAnnotation');
		}
		return <IPropertyAnnotation>propertyAnnotation;
	}

	getTypeByKey(key: string): Type {
		return <Type>this.getPropertyAnnotationByKey(key).$type;
	}

	getPropertyNames(): string[] {
		var entityAnnotation = this.EntityStatic.$entity;
		var keys = this.getKeys();
		return _.map(keys, (key: string) => {
			return (<IPropertyAnnotation>entityAnnotation[key]).$name;
		});
	}

	getName(): string {
		return this.EntityStatic.$entity.$name;
	}

	getObjectPropertyName(): string {
		return this.EntityStatic.$entity.$object;
	}

	private isPropertyAnnotation(propertyAnnotation: Type|ITypeStatic|string|DatabaseSystem|IPropertyAnnotation) {
		return typeof propertyAnnotation === 'object'
			&& typeof (<IPropertyAnnotation>propertyAnnotation).$name !== 'undefined'
			&& typeof (<IPropertyAnnotation>propertyAnnotation).$type !== 'undefined';
	}
}
