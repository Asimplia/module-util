
import DatabaseSystem = require('../../Repository/DatabaseSystem');
import IPropertyAnnotation = require('./IPropertyAnnotation');
import Type = require('../../Mapping/Annotation/Type');
import ITypeStatic = require('../../Mapping/Annotation/ITypeStatic');
import IEmbeddedAnnotation = require('./IEmbeddedAnnotation');

export = IEntityAnnotation;
interface IEntityAnnotation extends IEmbeddedAnnotation {
	$dbs: DatabaseSystem;
	$object?: string;
}
