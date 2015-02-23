
import IPropertyAnnotation = require('./IPropertyAnnotation');
import Type = require('../../Mapping/Annotation/Type');
import ITypeStatic = require('../../Mapping/Annotation/ITypeStatic');
import DatabaseSystem = require('../../DBS/DatabaseSystem');

export = IEmbeddedAnnotation;
interface IEmbeddedAnnotation {
	$name?: string;
	[propertyName: string]: IPropertyAnnotation|Type|ITypeStatic|IEmbeddedAnnotation
		|DatabaseSystem|string;
}
