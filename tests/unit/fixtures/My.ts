
import DatabaseSystem = require('../../../src/ODBM/Repository/DatabaseSystem');
import IEntityAnnotation = require('../../../src/ODBM/Entity/Annotation/IEntityAnnotation');
import Type = require('../../../src/ODBM/Mapping/Type');

export = My;
module My {
	export class MyEntity {

		static $entity: IEntityAnnotation = {
			$dbs: DatabaseSystem.MONGO_DB,
			$name: 'my_entity',
			id: Type.Integer,
			name: { $name: 'entity_name', $type: Type.String },
			embedded: {
				description: new Type.String(1000),
				createdAt: { $name: 'created_at', $type: Type.Date }
			}
		};

		get Object() { return this.object; }

		constructor(
			private object: MyEntityObject
		) {}
	}

	export interface MyEntityObject {
		id: number;
		name: string;
		embedded: {
			description: string;
			createdAt: Date;
		};
	}
}
