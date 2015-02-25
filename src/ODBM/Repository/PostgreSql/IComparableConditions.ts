
type ComparableTypes = number|Date;

export = IComparableConditions;
interface IComparableConditions {
	$gt?: ComparableTypes;
	$lt?: ComparableTypes;
	$gte?: ComparableTypes;
	$lte?: ComparableTypes;
}
