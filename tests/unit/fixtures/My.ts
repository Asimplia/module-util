
import DatabaseSystem = require('../../../src/ODBM/Repository/DatabaseSystem');
import IEntityAnnotation = require('../../../src/ODBM/Entity/Annotation/IEntityAnnotation');
import Type = require('../../../src/ODBM/Mapping/Type');

export = My;
module My {
	'use strict';

	export class MyEntity {

		static $entity: IEntityAnnotation = {
			$dbs: DatabaseSystem.MONGO_DB,
			$name: 'my_entity',
			id: new Type.Id(Type.Integer),
			name: { $name: 'entity_name', $type: Type.String },
			embedded: {
				description: new Type.String(1000),
				createdAt: { $name: 'created_at', $type: Type.Date }
			},
			arrayEmbedded: new Type.Array({
				coolness: Type.Integer
			}),
			array: new Type.Array(Type.String),
			nullableArray: new Type.Array(Type.String, true)
		};

		get Object() { return this.object; }

		constructor(
			private object: IMyEntityObject
		) {}
	}

	export interface IMyEntityObject {
		id: number;
		name: string;
		embedded: {
			description: string;
			createdAt: Date;
		};
		arrayEmbedded: {
			coolness: number;
		}[];
		array: string[];
	}
}
