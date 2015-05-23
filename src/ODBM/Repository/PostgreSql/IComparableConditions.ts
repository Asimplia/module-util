
import ComparableTypes = require('./ComparableTypes');

export = IComparableConditions;
interface IComparableConditions {
	$gt?: ComparableTypes;
	$lt?: ComparableTypes;
	$gte?: ComparableTypes;
	$lte?: ComparableTypes;
	$in?: ComparableTypes[];
	$ne?: ComparableTypes;
}
