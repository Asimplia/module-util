
import AnnotationInteger = require('./Annotation/Integer');
import AnnotationFloat = require('./Annotation/Float');
import AnnotationId = require('./Annotation/Id');
import AnnotationDate = require('./Annotation/Date');
import AnnotationString = require('./Annotation/String');
import AnnotationBoolean = require('./Annotation/Boolean');
import AnnotationArray = require('./Annotation/Array');

export = Type;
class Type {

	static get Integer() { return AnnotationInteger; }
	static get Float() { return AnnotationFloat; }
	static get Id() { return AnnotationId; }
	static get Date() { return AnnotationDate; }
	static get String() { return AnnotationString; }
	static get Boolean() { return AnnotationBoolean; }
	static get Array() { return AnnotationArray; }
}
