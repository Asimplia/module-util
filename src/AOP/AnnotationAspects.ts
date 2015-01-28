
import IAspect = require('./IAspect');
import AspectInterception = require('./AspectInterception');
import DependencyInjection = require('../DI/DependencyInjection');
import _ = require('underscore');
var Finder = require('fs-finder');

export = AnnotationAspects;
class AnnotationAspects implements IAspect {

	static ANNOTATION_ASPECT = '$aspect';
	static FILES_PATTERN = '*.js';

	static $args = [null];
	static $inject = [AspectInterception, DependencyInjection];
	constructor(
		private paths: string|string[],
		private aspectInterception: AspectInterception,
		private dependencyInjection: DependencyInjection
	) {
		if (typeof paths === 'string') {
			this.paths = [paths];
		}
		this.aspectInterception.addAspect('AOP.AnnotationAspects', this);
	}

	intercept() {
		var files = _.flatten(_.map(this.paths, (path: string) => {
			return Finder.from(path).findFiles(AnnotationAspects.FILES_PATTERN);
		}));
		files.forEach((file: string) => {
			var Static = require(file);
			if (typeof Static !== 'function') {
				return;
			}
			var aspectName = Static[AnnotationAspects.ANNOTATION_ASPECT];
			if (typeof aspectName !== 'string') {
				return;
			}
			if (!this.dependencyInjection.hasService(Static)) {
				throw new Error('Aspect annotated with $aspect needs to be a service in DependencyInjection container');
			}
			var aspect = this.dependencyInjection.get<any>(Static);
			this.aspectInterception.addAspect(aspectName, aspect);
		});
	}
}
