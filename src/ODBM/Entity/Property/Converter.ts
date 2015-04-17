
import _ = require('underscore');
import moment = require('moment');
import Type = require('../../Mapping/Annotation/Type');
import AnnotationBoolean = require('../../Mapping/Annotation/Boolean');
import AnnotationDate = require('../../Mapping/Annotation/Date');
import AnnotationId = require('../../Mapping/Annotation/Id');
import AnnotationInteger = require('../../Mapping/Annotation/Integer');
import AnnotationFloat = require('../../Mapping/Annotation/Float');
import AnnotationString = require('../../Mapping/Annotation/String');
import AnnotationArray = require('../../Mapping/Annotation/Array');

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
			case type instanceof AnnotationFloat:
				return this.convertFloat(<AnnotationFloat>type, value);
			case type instanceof AnnotationString:
				return this.convertString(<AnnotationString>type, value);
			case type instanceof AnnotationArray:
				return this.convertArray(<AnnotationArray>type, value);
		}
		throw new Error('Specified Type ' + (typeof type === 'function' ? (<any>type).constructor.name : type) + ' is not implemented');
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
		var integerValue = parseInt(value, 10);
		if (integerValue < range.min || integerValue > range.max) {
			throw new Error('Integer is out of type range. Should be between <' + range.min + ';' + range.max + '> but ' + integerValue + ' given.');
		}
		return integerValue;
	}

	convertFloat(type: AnnotationFloat, value: any): number {
		value = this.getNullOrValue(type, value);
		if (value === null) {
			return null;
		}
		var floatValue = parseFloat(value);
		return floatValue;
	}

	convertString(type: AnnotationString, value: any): string {
		value = this.getNullOrValue(type, value);
		if (value === null) {
			return null;
		}
		var stringValue = '' + value;
		if (stringValue.length > type.Length) {
			throw new Error('String is out of size. Should be ' + type.Length + ' but ' + stringValue.length + ' given.');
		}
		return stringValue;
	}

	convertId(type: AnnotationId, value: any): any {
		var idType = type.Type;
		var idValue = this.convertByType(idType, value);
		return idValue;
	}

	convertArray(type: AnnotationArray, value: any[]) {
		value = this.getNullOrValue(type, value);
		if (value === null) {
			return null;
		}
		return _.map(value, (itemValue: any) => {
			if (!type.ItemType) {
				throw new Error('Array type must have scalar items types in property converter');
			}
			return this.convertByType(type.ItemType, itemValue);
		});
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
