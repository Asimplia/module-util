
import _ = require('underscore');

export = EnumHelper;
class EnumHelper {

	static getEnumString(enumType: any, key: any): string {
		if (!_.isNumber(key)) {
			return key;
		} else {
			return enumType[key];
		}
	}

	static getEnum<EnumType>(enumType: any, enumString: string): /*EnumType*/any {
		if (_.isNumber(enumString)) {
			return enumString;
		} else {
			return enumType[enumString];
		}
	}

	static getEnumStrings(enumType: any): string[]{
		enumType = _.filter(enumType, (enumValue) => {
			return _.isNumber(enumValue);
		});
		return _.map<any, string>(enumType, (enumValue): string => {
			return this.getEnumString(enumType, enumValue);
		});
	}

	static getEnums<EnumType>(enumType: any): EnumType[] {
		enumType = _.filter(enumType, (enumValue) => {
			return _.isString(enumValue);
		});
		return _.map<string, EnumType>(enumType, (enumValue: string): EnumType => {
			return this.getEnum<EnumType>(enumType, enumValue);
		});
	}
}
