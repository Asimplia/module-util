
import DatabaseSystem = require('../../DBS/DatabaseSystem');
import IPropertyAnnotation = require('./IPropertyAnnotation');

export = IEntityAnnotation;
interface IEntityAnnotation {
	$dbs: DatabaseSystem;
	$name?: string;
	$object?: string;
	[propertyName: string]: IPropertyAnnotation
		|DatabaseSystem|string;
}
