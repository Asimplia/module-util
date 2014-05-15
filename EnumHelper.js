var _ = require('underscore');

var EnumHelper = (function () {
    function EnumHelper() {
    }
    EnumHelper.getEnumString = function (enumType, key) {
        if (!_.isNumber(key)) {
            return key;
        } else {
            return enumType[key];
        }
    };

    EnumHelper.getEnum = function (enumType, enumString) {
        if (_.isNumber(enumString)) {
            return enumString;
        } else {
            return enumType[enumString];
        }
    };

    EnumHelper.getEnumStrings = function (enumType) {
        var _this = this;
        enumType = _.filter(enumType, function (enumValue) {
            return _.isNumber(enumValue);
        });
        return _.map(enumType, function (enumValue) {
            return _this.getEnumString(enumType, enumValue);
        });
    };

    EnumHelper.getEnums = function (enumType) {
        var _this = this;
        enumType = _.filter(enumType, function (enumValue) {
            return _.isString(enumValue);
        });
        return _.map(enumType, function (enumValue) {
            return _this.getEnum(enumType, enumValue);
        });
    };
    return EnumHelper;
})();
module.exports = EnumHelper;
//# sourceMappingURL=EnumHelper.js.map
