
export = IManager;
interface IManager<Entity, EntityObject> {
	
	insert(entity: Entity, callback: (e: Error, entity?: Entity) => void): IManager<Entity, EntityObject>;
}
