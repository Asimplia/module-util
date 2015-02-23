
import List = require('../Entity/List');

export = IManager;
interface IManager<Entity, EntityObject> {
	
	insert(entity: Entity, callback: (e: Error, entity?: Entity) => void): IManager<Entity, EntityObject>;
	insertList(entityList: List<Entity>, callback: (e: Error, entityList?: List<Entity>) => void): IManager<Entity, EntityObject>;
}
