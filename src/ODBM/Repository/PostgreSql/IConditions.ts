
import IComparableConditions = require('./IComparableConditions');

type CommonTypes = string|number|Date|boolean;

export = IConditions;
interface IConditions {
	[key: string]: CommonTypes|IComparableConditions;
}
