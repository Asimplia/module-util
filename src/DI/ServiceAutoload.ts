
import DependencyInjection = require('./DependencyInjection');
import _ = require('underscore');
import fs = require('fs');
import finder = require('fs-finder');

export = ServiceAutoload;
class ServiceAutoload {

	static ANNOTATION_SERVICE = '$service';
	static FILES_PATTERN = '*.js';

	private paths: string[];

	static $aspect = 'DI.ServiceAutoload';
	static $args = [null];
	static $inject = [
		DependencyInjection
	];
	constructor(
		paths: string|string[],
		private dependencyInjection: DependencyInjection
	) {
		if (typeof paths === 'string') {
			this.paths = [paths];
		} else {
			this.paths = paths;
		}
	}

	intercept() {
		var serviceDefinitions: {[name: string]: any} = {};
		var classes = this.getClasses();
		classes.forEach((Static: any) => {
			if (typeof Static !== 'function') {
				return;
			}
			var serviceName = Static[ServiceAutoload.ANNOTATION_SERVICE];
			if (typeof serviceName === 'undefined') {
				return;
			}
			if (typeof serviceName !== 'string') {
				throw new Error(ServiceAutoload.ANNOTATION_SERVICE + ' annotation must be string. ' + serviceName + ' given.');
			}
			serviceDefinitions[serviceName] = Static;
		});
		this.dependencyInjection.addServiceDefinitions(serviceDefinitions);
	}

	private getClasses() {
		return _.map(_.flatten(_.map(this.paths, (path: string) => {
			if (fs.lstatSync(path).isFile()) { // TODO check pattern FILES_PATTERN
				return path;
			}
			return finder.from(path).findFiles(ServiceAutoload.FILES_PATTERN);
		})), (file: string) => {
			return require(file);
		});
	}

}
