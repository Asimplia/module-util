
import _ = require('underscore');
import moment = require('moment');
import Type = require('../../Mapping/Annotation/Type');
import AnnotationBoolean = require('../../Mapping/Annotation/Boolean');
import AnnotationDate = require('../../Mapping/Annotation/Date');
import AnnotationId = require('../../Mapping/Annotation/Id');
import AnnotationInteger = require('../../Mapping/Annotation/Integer');
import AnnotationString = require('../../Mapping/Annotation/String');

export = Converter;
class Converter {
	
	convertByType(type: Type, value: any): any {
		switch (true) {
			case type instanceof AnnotationBoolean:
				return this.convertBoolean(<AnnotationBoolean>type, value);
			case type instanceof AnnotationDate:
				return this.convertDate(<AnnotationDate>type, value);
			case type instanceof AnnotationId:
				return this.convertId(<AnnotationId>type, value);
			case type instanceof AnnotationInteger:
				return this.convertInteger(<AnnotationInteger>type, value);
			case type instanceof AnnotationString:
				return this.convertString(<AnnotationString>type, value);
		}
		throw new Error('Specified Type ' + (<any>type).constructor.name + ' is not implemented');
	}

	convertBoolean(type: AnnotationBoolean, value: any): boolean {
		value = this.getNullOrValue(type, value);
		if (value === null) {
			return null;
		}
		return !!value;
	}

	convertDate(type: AnnotationDate, value: any): Date {
		value = this.getNullOrValue(type, value);
		if (value === null) {
			return null;
		}
		return moment(value).toDate();
	}

	convertInteger(type: AnnotationInteger, value: any): number {
		value = this.getNullOrValue(type, value);
		if (value === null) {
			return null;
		}
		var size = Math.pow(2, type.Length * 8); // 8bits on every byte
		var range = { min: - size / 2, max: size / 2 - 1 };
		var integerValue = parseInt(value);
		if (integerValue < range.min || integerValue > range.max) {
			throw new Error('Integer is out of type range');
		}
		return integerValue;
	}

	convertString(type: AnnotationString, value: any): string {
		value = this.getNullOrValue(type, value);
		if (value === null) {
			return null;
		}
		var stringValue = "" + value;
		if (stringValue.length > type.Length) {
			throw new Error('String is out of size');
		}
		return stringValue;
	}

	convertId(type: AnnotationId, value: any): any {
		var idType = type.Type;
		var idValue = this.convertByType(idType, value);
		return idValue;
	}

	private getNullOrValue(type: Type, value: any) {
		var valueIsNull = _.isNull(value) || _.isUndefined(value);
		if (!type.Nullable) {
			if (valueIsNull) {
				throw new Error('Specified type is not nullable, then should not be null or undefined');
			}
			return value;
		} else {
			return valueIsNull ? null : value;
		}
	}
}
