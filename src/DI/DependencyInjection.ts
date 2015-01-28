
import IConstructor = require('./IConstructor');
import IServiceDefinition = require('./IServiceDefinition');
var hash = require('object-hash');

export = DependencyInjection;
class DependencyInjection {

	private static DEPENDENCY_INJECTION_TO_SERVICE_DELIMITER = ':';
	private static HASH_KEY = '$.__DependencyInjection__.HASH_KEY';

	private dependencyInjections: { [name: string]: DependencyInjection } = {};
	private services: {[name: string]: any} = {};
	private serviceFactories: {[name: string]: Function} = {};
	private serviceNamesByContructor: {[constructorHash: string]: string} = {};

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
		this.addServiceFactory('DependencyInjection', this.createFactorySimple(this), DependencyInjection);
		this.addServiceDefinitions(serviceDefs);
	}

	addServiceDefinitions(serviceDefs: {[name: string]: any|IConstructor|IServiceDefinition}) {
		this.getKeys(serviceDefs).forEach((name: string) => {
			var def: any = serviceDefs[name];
			this.prepareServiceDefinition(name, def);
		});
		this.getKeys(serviceDefs).forEach((name: string) => {
			var def: any = serviceDefs[name];
			this.afterPrepared(name, def);
		});
	}

	private prepareServiceDefinition(name: string, def: any|IConstructor|IServiceDefinition) {
		if (typeof def === 'function') {
			def = { $class: def };
		}
		if (typeof def === 'object' && this.isServiceDefinition(def)) {
			this.addServiceFactory(name, this.createFactoryByDefinition(def), def.$class);
		} else {
			this.addServiceFactory(name, this.createFactorySimple(def));
		}
	}

	private afterPrepared(name: string, def: any|IConstructor|IServiceDefinition) {
		if (typeof def === 'function') {
			def = { $class: def };
		}
		if (
			typeof def === 'object' && this.isServiceDefinition(def) 
			&& (
				def.$run === true 
				|| (def.$run !== false && typeof def.$class !== 'undefined' && def.$class.$run === true)
			)
		) {
			this.service(name);
		}
	}

	private addServiceFactory(name: string, factory: Function, clazz?: IConstructor) {
		if (!name) {
			throw new Error('Name of service must be non empty');
		}
		this.serviceFactories[name] = factory;
		if (typeof clazz === 'function') {
			this.serviceNamesByContructor[this.getHash(clazz)] = name;
		}
	}

	private createFactorySimple(def: any) {
		return () => {
			return def;
		};
	}

	private createFactoryByClass(Constructor: IConstructor, args: string[]|Object[], inject: string[]) {
		return () => {
			var injectServices = this.getInjectServices(args, inject);
			return new (Constructor.bind.apply(Constructor, [Constructor].concat(injectServices)))();
		};
	}

	private createFactoryByFactory(factory: (...args: any[]) => any, args: string[]|Object[], inject: string[]) {
		return () => {
			var injectServices = this.getInjectServices(args, inject);
			return factory.apply(factory, injectServices);
		};
	}

	private getInjectServices(args: string[]|Object[], inject: string[]) {
		var injectServices = [];
		if (typeof inject !== 'undefined') {
			inject.forEach((name: string) => {
				var service = this.service(name);
				injectServices.push(service);
			});
		}
		if (typeof args !== 'undefined') {
			injectServices = args.concat(injectServices);
		}
		return injectServices;
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
			return this.createFactoryByFactory(
				serviceDef.$factory, 
				serviceDef.$args || [], 
				serviceDef.$inject || []
			);
		}
		if (typeof serviceDef['$class'] === 'function') {
			return this.createFactoryByClass(
				serviceDef['$class'], 
				serviceDef.$args || serviceDef['$class'].$args, 
				serviceDef.$inject || serviceDef['$class'].$inject
			);
		}
		throw new Error('Invalid state');
	}

	private isServiceDefinition(def: any) {
		return typeof def.$factory !== 'undefined' 
			|| typeof def['$class'] !== 'undefined' 
			|| typeof def.$args !== 'undefined' 
			|| typeof def.$path !== 'undefined' 
			|| typeof def.$run !== 'undefined';
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

	private getNameByConstructor(constructor: IConstructor) {
		var name = this.serviceNamesByContructor[this.getHash(constructor)];
		if (!name) {
			for (var diName in this.dependencyInjections) {
				var subName = this.dependencyInjections[diName].getNameByConstructor(constructor);
				if (subName) {
					name = diName + DependencyInjection.DEPENDENCY_INJECTION_TO_SERVICE_DELIMITER + subName;
					break;
				}
			}
			if (!name) {
				throw new Error('Service not found by constructor ' + constructor);
			}
		}
		return name;
	}

	private getHash(object: any): string {
		if (typeof object[DependencyInjection.HASH_KEY] === 'undefined') {
			object[DependencyInjection.HASH_KEY] = hash(object);
		}
		return object[DependencyInjection.HASH_KEY];
	}

	private getName(nameOrConstructor: string|IConstructor) {
		var name: string;
		if (typeof nameOrConstructor !== 'string') {
			name = this.getNameByConstructor(nameOrConstructor);
		} else {
			name = <string>nameOrConstructor;
		}
		return name;
	}

	hasService(nameOrConstructor: any) {
		var name = this.getName(nameOrConstructor);
		return typeof this.services[name] !== 'undefined' 
			|| typeof this.serviceFactories[name] !== 'undefined'
			|| this.hasSubService(name);
	}

	/* @deprecated Use get() or byName() */
	service(nameOrConstructor: string|IConstructor) {
		var name = this.getName(nameOrConstructor);
		if (!name) {
			throw new Error('Name of service must be non empty');
		}
		if (typeof this.services[name] === 'undefined') {
			if (typeof this.serviceFactories[name] === 'undefined') {
				if (this.hasSubService(name)) {
					this.services[name] = this.subService(name);
				} else {
					var parts = name.split(DependencyInjection.DEPENDENCY_INJECTION_TO_SERVICE_DELIMITER);
					var dependencyInjectionName = parts.shift();
					var subName = parts.join(DependencyInjection.DEPENDENCY_INJECTION_TO_SERVICE_DELIMITER);
					if (subName) {
						var subDependencyInjection = this.getDependencyInjection(dependencyInjectionName);
						if (subDependencyInjection.hasService(subName)) {
							return subDependencyInjection.service(subName);
						}
					}
					throw new Error('Service ' + name + ' is not declared');
				}
			} else {
				this.services[name] = this.serviceFactories[name].apply(this);
			}
		}
		if (typeof this.services[name] === 'undefined' || this.services[name] === null) {
			throw new Error('Service must be not null nor undefined of name "' + name + '"');
		}
		return this.services[name];
	}

	byName(name: string) {
		return this.service(name);
	}

	get<Service>(constructor: any): Service {;
		return this.service(constructor);
	}

	addService(name: string, service: any) {
		this.addServiceFactory(name, this.createFactorySimple(service));
	}

	getDependencyInjection(name: string) {
		if (typeof this.dependencyInjections[name] === 'undefined') {
			throw new Error('DependencyInjection named "' + name + '" not found');
		}
		return this.dependencyInjections[name];
	}
}
