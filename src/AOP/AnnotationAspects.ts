
import IAspect = require('./IAspect');

export = AnnotationAspects;
class AnnotationAspects implements IAspect {
	// TODO add loading of all registered dirs & look for $aspect annotations to apply aspects
	constructor(
		private paths: string|string[]
	) {}

	intercept() {
		// TODO
	}
}
