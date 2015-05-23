
import IComparableConditions = require('./IComparableConditions');

import CommonTypes = require('./CommonTypes');

export = IConditions;
interface IConditions {
	[key: string]: CommonTypes|IComparableConditions;
	$limit?: number;
	$offset?: number;
}
