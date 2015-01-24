
interface IServiceDefinition {
	$path?: string;
	$class?: IConstructor;
	$args?: string[]|Object[];
	$factory?: Function;
	$inject?: string[];
}

interface IConstructor extends IServiceDefinition {
	new (): Object;
}

export = DependencyInjection;
class DependencyInjection {

	private static DEPENDENCY_INJECTION_TO_SERVICE_DELIMITER = ':';

	private dependencyInjections: { [name: string]: DependencyInjection } = {};
	private services: {[name: string]: any} = {};
	private serviceFactories: {[name: string]: Function} = {};

	get Name() { return this.name; }

	constructor(
		private name: string, 
		private serviceDefs: {[name: string]: any|IConstructor|IServiceDefinition},
		dependencyInjections: DependencyInjection[] = []
	) {
		for (var i in dependencyInjections) {
			var dependencyInjection = dependencyInjections[i];
			this.dependencyInjections[dependencyInjection.Name] = dependencyInjection;
		}
		this.prepareServiceFactories(serviceDefs);
		this.addService('DependencyInjection', this);
	}

	private prepareServiceFactories(serviceDefs: {[name: string]: any|IConstructor|IServiceDefinition}) {
		this.getKeys(serviceDefs).forEach((name: string) => {
			var def: any = serviceDefs[name];
			if (typeof def === 'function') {
				def = { $class: def };
			}
			if (typeof def === 'object' && this.isServiceDefinition(def)) {
				this.serviceFactories[name] = this.createFactoryByDefinition(def);
			} else {
				this.serviceFactories[name] = this.createFactorySimple(def);
			}
		});
	}

	private createFactorySimple(def: any) {
		return () => {
			return def;
		};
	}

	private createFactoryByClass(Constructor: IConstructor, args: string[]|Object[], inject: string[]) {
		return () => {
			var names = inject || Constructor.$inject;
			var injectServices = [];
			if (typeof names !== 'undefined') {
				names.forEach((name: string) => {
					var service = this.service(name);
					injectServices.push(service);
				});
			}
			injectServices = args.concat(injectServices);
			return new (Constructor.bind.apply(Constructor, [Constructor].concat(injectServices)))();
		};
	}

	private createFactoryByDefinition(serviceDef: IServiceDefinition) {
		if (typeof serviceDef['$class'] === 'undefined' && typeof serviceDef.$path === 'undefined' && typeof serviceDef.$factory === 'undefined') {
			throw new Error('Class "$class" or "$path" or "$factory" should be specified');
		}
		if (typeof serviceDef.$path !== 'undefined') {
			if (typeof serviceDef.$path !== 'string') {
				throw new Error('"$path" should be string');
			}
			serviceDef['$class'] = require(serviceDef.$path);
		}
		if (typeof serviceDef.$factory !== 'undefined') {
			if (typeof serviceDef.$factory !== 'function') {
				throw new Error('"$factory" should be function');
			}
			return serviceDef.$factory;
		}
		if (typeof serviceDef['$class'] === 'function') {
			return this.createFactoryByClass(serviceDef['$class'], serviceDef.$args || [], serviceDef.$inject);
		}
		throw new Error('Invalid state');
	}

	private isServiceDefinition(def: any) {
		return typeof def.$factory !== 'undefined' 
			|| typeof def['$class'] !== 'undefined' 
			|| typeof def.$args !== 'undefined' 
			|| typeof def.$path !== 'undefined';
	}

	private getKeys(object: any) {
		return Object.keys(object);
	}

	private subService(name: string) {
		var dependencyInjectionNames = this.getKeys(this.dependencyInjections);
		for (var i in dependencyInjectionNames) {
			var dependencyInjectionName = dependencyInjectionNames[i];
			var dependencyInjection = this.getDependencyInjection(dependencyInjectionName);
			if (dependencyInjection.hasService(name)) {
				return dependencyInjection.service(name);
			}
		}
		throw new Error('Service ' + name + ' is not declared');
	}

	private hasSubService(name: string) {
		for (var dependencyInjectionName in this.dependencyInjections) {
			if (this.dependencyInjections[dependencyInjectionName].hasService(name)) {
				return true;
			}
		}
		return false;
	}

	hasService(name: string) {
		return typeof this.services[name] !== 'undefined' 
			|| typeof this.serviceFactories[name] !== 'undefined'
			|| this.hasSubService(name);
	}

	service(name: string) {
		if (typeof this.services[name] === 'undefined') {
			if (typeof this.serviceFactories[name] === 'undefined') {
				if (this.hasSubService(name)) {
					this.services[name] = this.subService(name);
				} else {
					var parts = name.split(DependencyInjection.DEPENDENCY_INJECTION_TO_SERVICE_DELIMITER);
					var dependencyInjectionName = parts.shift();
					var subName = parts.join(DependencyInjection.DEPENDENCY_INJECTION_TO_SERVICE_DELIMITER);
					var subDependencyInjection = this.getDependencyInjection(dependencyInjectionName);
					if (subDependencyInjection.hasService(subName)) {
						return subDependencyInjection.service(subName);
					}
					throw new Error('Service ' + name + ' is not declared');
				}
			} else {
				this.services[name] = this.serviceFactories[name].apply(this);
			}
		}
		return this.services[name];
	}

	addService(name: string, service: any) {
		this.serviceFactories[name] = this.createFactorySimple(service);
	}

	getDependencyInjection(name: string) {
		if (typeof this.dependencyInjections[name] === 'undefined') {
			throw new Error('DependencyInjection named "' + name + '" not found');
		}
		return this.dependencyInjections[name];
	}
}
