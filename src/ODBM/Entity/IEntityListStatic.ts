
import List = require('./List');

export = IEntityListStatic;
interface IEntityListStatic<EntityList extends List<any/*Entity*/>, Entity> {
	new (entities: Entity[]): EntityList;
}
