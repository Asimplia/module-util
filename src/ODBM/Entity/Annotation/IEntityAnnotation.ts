
import DatabaseSystem = require('../../Repository/DatabaseSystem');
import IEmbeddedAnnotation = require('./IEmbeddedAnnotation');

export = IEntityAnnotation;
interface IEntityAnnotation extends IEmbeddedAnnotation {
	$dbs: DatabaseSystem;
	$object?: string;
}
