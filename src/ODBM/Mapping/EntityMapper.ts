
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
		return this.getEmbeddedKeys();
	}

	getEmbeddedKeys(...keys: string[]) {
		var annotation: any = this.EntityStatic.$entity;
		keys.forEach((key: string) => {
			annotation = annotation[key];
		});
		var annotationKeys = Object.keys(annotation);
		return _.filter(annotationKeys, (annotationKey: string) => {
			return annotationKey.substr(0, 1) !== '$';
		});
	}

	private getAnnotationByKey(...keys: string[]): IPropertyAnnotation {
		var entityAnnotation = this.EntityStatic.$entity;
		var annotation = <any>entityAnnotation;
		keys.forEach((key: string) => {
			annotation = annotation[key];
		});
		if (!this.isAnnotation(annotation)) {
			throw new Error('Getting by keys ' + keys + ' is not proper Annotation of $entity');
		}
		return <IPropertyAnnotation>annotation;
	}

	getPropertyNameByKey(...keys: string[]): string {
		var propertyAnnotation = this.getAnnotationByKey.apply(this, keys);
		return propertyAnnotation.$name;
	}

	getPropertyTypeByKey(...keys: string[]): Type {
		var propertyAnnotation = this.getAnnotationByKey.apply(this, keys);
		return <Type>propertyAnnotation.$type;
	}

	isEmbeddedByKey(...keys: string[]): boolean {
		return typeof this.getAnnotationByKey.apply(this, keys).$type === 'undefined';
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

	private isAnnotation(annotation: any) {
		return typeof annotation === 'object'
			&& typeof annotation.$name !== 'undefined';
	}
}
