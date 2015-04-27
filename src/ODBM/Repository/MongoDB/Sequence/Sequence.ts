
import IEntityAnnotation = require('../../../Entity/Annotation/IEntityAnnotation');
import DatabaseSystem = require('../../DatabaseSystem');
import Type = require('../../../Mapping/Type');
import ISequenceObject = require('./ISequenceObject');

export = Sequence;
class Sequence {

	static $entity: IEntityAnnotation = {
		$dbs: DatabaseSystem.MONGO_DB,
		id: new Type.Id(Type.String, true),
		seq: Type.Integer
	};

	private object: ISequenceObject;

	get Seq() { return this.object.seq; }
}
