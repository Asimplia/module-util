
import DatabaseSystem = require('../../DBS/DatabaseSystem');
import IPropertyAnnotation = require('./IPropertyAnnotation');
import Type = require('../../Mapping/Annotation/Type');
import ITypeStatic = require('../../Mapping/Annotation/ITypeStatic');

export = IEntityAnnotation;
interface IEntityAnnotation {
	$dbs: DatabaseSystem;
	$name?: string;
	$object?: string;
	[propertyName: string]: IPropertyAnnotation|Type|ITypeStatic
		|DatabaseSystem|string;
}
