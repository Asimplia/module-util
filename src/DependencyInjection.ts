
interface IServiceDefinition {
	path?: string;
	fn?: IConstructor;
	args?: string[]|Object[];
	factory?: Function;
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
	    Object.keys(serviceDefs).forEach((name: string) => {
	        var def = serviceDefs[name];
	        if (typeof def === 'function') { // def instanceof IConstructor
	            def = { fn: def };
	        }
	        if (typeof def === 'object' && (
	        	typeof (<IServiceDefinition>def).factory !== 'undefined' 
	        	|| typeof (<IServiceDefinition>def).fn !== 'undefined' 
	        	|| typeof (<IServiceDefinition>def).args !== 'undefined' 
	        	|| typeof (<IServiceDefinition>def).path !== 'undefined'
	        )) { // def instanceof IServiceDefinition
            	this.serviceFactories[name] = this.createFactoryByDefinition(<IServiceDefinition>def);
            } else {
                this.serviceFactories[name] = () => { return def; };
            }
	    });
	}

	private createFactoryByClass(Constructor: IConstructor, args: string[]|Object[]) {
		return () => {
            var names = Constructor.$inject;
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
        if (typeof serviceDef.fn === 'undefined' && typeof serviceDef.path === 'undefined' && typeof serviceDef.factory === 'undefined') {
            throw new Error('Class "fn" or "path" or "factory" should be specified');
        }
        if (typeof serviceDef.path !== 'undefined') {
        	if (typeof serviceDef.path !== 'string') {
        		throw new Error('"path" should be string');
        	}
        	serviceDef.fn = require(serviceDef.path);
        }
        if (typeof serviceDef.factory !== 'undefined') {
        	if (typeof serviceDef.factory !== 'function') {
        		throw new Error('"factory" should be function');
        	}
        	return serviceDef.factory;
        }
        if (typeof serviceDef.fn === 'function') {
	        return this.createFactoryByClass(serviceDef.fn, serviceDef.args || []);
    	}
    	throw new Error('Invalid state');
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
