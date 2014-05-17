/// <reference path="./typings/underscore/underscore.d.ts" />
var _ = require('underscore');

var ArrayHelper = (function () {
    function ArrayHelper() {
    }
    ArrayHelper.mapFilterNulls = function (object, iterator) {
        var mappedArray = _.map(object, iterator);
        var filteredArray = _.filter(mappedArray, function (value) {
            return value !== null;
        });
        return filteredArray;
    };

    ArrayHelper.mapFilterEmptys = function (object, iterator) {
        var mappedArray = _.map(object, iterator);
        var filteredArray = _.filter(mappedArray, function (value) {
            return value !== "";
        });
        return filteredArray;
    };
    return ArrayHelper;
})();
module.exports = ArrayHelper;
//# sourceMappingURL=ArrayHelper.js.map
