
import IAspect = require('./IAspect');

interface IAspectDefinition {
	$aspect?: any|IAspect;
	$method?: string;
	$interceptor?: Function;
}

export = AspectInterception;
class AspectInterception {

	private static ASPECT_INTERCEPTION_TO_ASPECT_DELIMITER = ':';

	private aspects: {[name: string]: any} = {};
	private aspectDefs: {[name: string]: any|IAspect|IAspectDefinition} = {};
	
	get Name() { return this.name; }

	constructor(
		private name: string,
		aspectDefs: {[name: string]: any|IAspect|IAspectDefinition}
	) {
		this.prepareAspects(aspectDefs);
		this.runAspects(this.getKeys(this.aspects));
	}

	private prepareAspects(aspectDefs: {[name: string]: any|IAspect|IAspectDefinition}) {
		this.getKeys(aspectDefs).forEach((name: string) => {
			var def: any = aspectDefs[name];
			if (typeof def === 'function') {
				def = { $interceptor: def };
			}
			if (typeof def === 'object') {
				if (this.isAspectDefinition(def)) {
					this.aspects[name] = this.createAspectByDefinition(def);
				} else {
					this.aspects[name] = def;
				}
			} else {
				throw new Error('Aspect "' + name + '" is not supported definition');
			}
			this.aspectDefs[name] = this.createAspectDefinition(this.aspects[name], def);
		});
	}

	private createAspectByDefinition(def: IAspectDefinition) {
		if (typeof def.$aspect !== 'object' && typeof def.$interceptor !== 'function') {
			throw new Error('Needs to declare $aspect or $interceptor in definition of aspect');
		}
		var aspect = def.$aspect || {};
		if (typeof def.$interceptor !== 'function' 
			&& typeof aspect.intercept !== 'function' 
			&& (typeof def.$method !== 'string' || typeof aspect[def.$method] !== 'function')) {
			throw new Error('Interceptor in $aspect or $method of $aspect is not function');
		}
		if (typeof def.$aspect !== 'undefined' && typeof def.$interceptor !== 'undefined') {
			throw new Error('Specify $aspect or $interceptor. Not both.');
		}
		return aspect;
	}

	private isAspectDefinition(def: any) {
		return typeof def.$aspect !== 'undefined' 
			|| typeof def.$method !== 'undefined' 
			|| typeof def.$interceptor !== 'undefined';
	}

	private runAspects(names: string[]) {
		names.forEach((name: string) => {
			var def = this.aspectDefs[name];
			var interceptor: Function;
			if (typeof def.$aspect[def.$method] === 'function') {
				interceptor = this.aspects[name][def.$method];
			} else
			if (typeof def.$aspect.intercept === 'function') {
				interceptor = this.aspects[name].intercept;
			} else
			if (typeof def.$interceptor === 'function') {
				interceptor = def.$interceptor;
			}
			interceptor.apply(def.$aspect, []);
		});
	}

	private getKeys(object: any) {
		return Object.keys(object);
	}

	private createAspectDefinition(aspect: IAspect, defaultDef: IAspectDefinition) {
		var AspectStatic = (<any>aspect).__proto__.constructor || {};
		return {
			$aspect: defaultDef.$aspect || aspect,
			$method: defaultDef.$method || AspectStatic.$method,
			$interceptor: defaultDef.$interceptor
		};
	}

	addAspect(name: string, aspect: IAspect) {
		this.aspectDefs[name] = this.createAspectDefinition(aspect, {});
		this.aspects[name] = this.createAspectByDefinition(this.aspectDefs[name]);
		this.runAspects([name]);
	}

	aspect(name: string) {
		if (typeof this.aspects[name] === 'undefined') {
			throw new Error('Aspect "' + name + '" not declared');
		}
		return this.aspects[name];
	}
}
