
import CollectionList = require('../../Collection/List');

export = List;
class List<Entity> extends CollectionList<Entity, List<Entity>> {

	constructor(
		entties: Entity[]
	) {
		super(entties, List);
	}
	
	protected get Entities() { return this.items; }
	protected set Entities(items: Entity[]) { this.items = items; }
}
