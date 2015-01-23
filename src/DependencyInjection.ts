
interface IServiceDefinition {
	path?: string;
	class?: IConstructor;
	args?: string[]|Object[];
	factory?: Function;
	inject?: string[];
}

interface IConstructor {
	$inject: string[];
	new (): Object;
}

export = DependencyInjection;
class DependencyInjection {

	private services: {[name: string]: Object};
	private serviceFactories: {[name: string]: Function};

	constructor(serviceDefs: {[name: string]: Object|IConstructor|IServiceDefinition}) {
		this.services = {};
		this.serviceFactories = {};
		this.prepareServiceFactories(serviceDefs);
	}

	private prepareServiceFactories(serviceDefs: {[name: string]: Object|IConstructor|IServiceDefinition}) {
		this.getKeys(serviceDefs).forEach((name: string) => {
			var def: any = serviceDefs[name];
			if (typeof def === 'function') {
				def = { class: def };
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
		if (typeof serviceDef['class'] === 'undefined' && typeof serviceDef.path === 'undefined' && typeof serviceDef.factory === 'undefined') {
			throw new Error('Class "class" or "path" or "factory" should be specified');
		}
		if (typeof serviceDef.path !== 'undefined') {
			if (typeof serviceDef.path !== 'string') {
				throw new Error('"path" should be string');
			}
			serviceDef['class'] = require(serviceDef.path);
		}
		if (typeof serviceDef.factory !== 'undefined') {
			if (typeof serviceDef.factory !== 'function') {
				throw new Error('"factory" should be function');
			}
			return serviceDef.factory;
		}
		if (typeof serviceDef['class'] === 'function') {
			return this.createFactoryByClass(serviceDef['class'], serviceDef.args || [], serviceDef.inject);
		}
		throw new Error('Invalid state');
	}

	private isServiceDefinition(def: any) {
		return typeof def.factory !== 'undefined' 
			|| typeof def['class'] !== 'undefined' 
			|| typeof def.args !== 'undefined' 
			|| typeof def.path !== 'undefined';
	}

	private getKeys(object: any) {
		return Object.keys(object);
	}

	service(name): any|Object {
		if (typeof this.services[name] === 'undefined') {
			if (typeof this.serviceFactories[name] === 'undefined') {
				throw new Error('Service ' + name + ' is not declared');
			}
			this.services[name] = this.serviceFactories[name].apply(this);
		}
		return this.services[name];
	}
}
