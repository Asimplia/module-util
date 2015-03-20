
import IAspect = require('./IAspect');
import AspectInterception = require('./AspectInterception');
import DependencyInjection = require('../DI/DependencyInjection');
import _ = require('underscore');
import fs = require('fs');
var finder = require('fs-finder');

export = AnnotationAspects;
class AnnotationAspects implements IAspect {

	static ANNOTATION_ASPECT = '$aspect';
	static FILES_PATTERN = '*.js';

	private paths: string[];

	static $args = [null];
	static $inject = [AspectInterception, DependencyInjection];
	constructor(
		paths: string|string[],
		private aspectInterception: AspectInterception,
		private dependencyInjection: DependencyInjection
	) {
		if (typeof paths === 'string') {
			this.paths = [paths];
		} else {
			this.paths = paths;
		}
		this.aspectInterception.addAspect('AOP.AnnotationAspects', this);
	}

	intercept() {
		var classes = this.getClasses();
		classes.forEach((Static: any) => {
			if (typeof Static !== 'function') {
				return;
			}
			var aspectName = Static[AnnotationAspects.ANNOTATION_ASPECT];
			if (typeof aspectName === 'undefined') {
				return;
			}
			if (typeof aspectName !== 'string') {
				throw new Error(AnnotationAspects.ANNOTATION_ASPECT + ' annotation must be string ' + aspectName + ' given.');
			}
			if (!this.dependencyInjection.hasService(Static)) {
				throw new Error('Aspect annotated with $aspect needs to be a service in DependencyInjection container');
			}
			var aspect = this.dependencyInjection.get<any>(Static);
			this.aspectInterception.addAspect(aspectName, aspect);
		});
	}

	private getClasses() {
		return _.map(_.flatten(_.map(this.paths, (path: string) => {
			if (fs.lstatSync(path).isFile()) { // TODO check pattern FILES_PATTERN
				return path;
			}
			return finder.from(path).findFiles(AnnotationAspects.FILES_PATTERN);
		})), (file: string) => {
			return require(file);
		});
	}
}
