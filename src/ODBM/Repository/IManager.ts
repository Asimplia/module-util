
import List = require('../Entity/List');

export = IManager;
interface IManager<Entity, EntityObject, EntityList> {
	
	insert(entity: Entity, callback: (e: Error, entity?: Entity) => void): IManager<Entity, EntityObject, EntityList>;
	insertList(entityList: List<Entity>, callback: (e: Error, entityList?: List<Entity>) => void): IManager<Entity, EntityObject, EntityList>;
}
