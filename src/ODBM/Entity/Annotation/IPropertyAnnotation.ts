
import Type = require('../../Mapping/Annotation/Type');
import ITypeStatic = require('../../Mapping/Annotation/ITypeStatic');

export = IPropertyAnnotation;
interface IPropertyAnnotation {
	$name: string;
	$type: Type|ITypeStatic;
	[propertyName: string]: IPropertyAnnotation
		|Type|ITypeStatic|string;
}
