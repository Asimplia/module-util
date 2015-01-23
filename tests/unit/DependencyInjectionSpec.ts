
import DependencyInjection = require('../../src/DependencyInjection');
import Ctrl = require('./MockCtrl');

var my = { hello: 'hello' };

var your = { world: 'world', to: 'to' };

var Our = function (your) {
	this.all = function () { 
		return your.to + ' all'
	};
};
(<any>Our).$inject = ['Your.Service'];

class NoDep {
	constructor(private arg1: string = '') {}

	hello() { return 'hello' + this.arg1; }
}

class Factoried {
	constructor(private arg1: string = '') {}

	hello() { return 'world' + this.arg1; }
}

module With {
	export class Parameter {
		static $inject = ['parameter.name'];
		constructor(public param: string) {}
	}
}

var defs: any = {
	'NoDep': {
		$class: NoDep,
		$args: [' 0113']
	},
	'Your.Service': your,
	'Your2.Service': { world: 'country'},
	'My.Service': my,
	'Our.Service': Our,
	'Ctrl': Ctrl,
	'parameter.name': 'some parameter injecting',
	'Factoried': {
		$factory: (ctrl: Ctrl, your: any) => {
			return new Factoried();
		},
		$inject: ['Ctrl', 'Your.Service']
	},
	'Path.Service': {
		$path: __dirname + '/MockCtrl',
	},
	'Ctrl2': {
		$class: Ctrl,
		$inject: ['My.Service', 'Your2.Service', 'Our.Service']
	},
	'With.Parameter': With.Parameter
};

describe('DependencyInjection', () => {

	it('should create service by constructor simple', () => {
		var di = new DependencyInjection({
			'NoDep': NoDep
		});
		expect(di.service('NoDep').hello()).toBe('hello');
	});

	it('should create service by constructor', () => {
		var di = new DependencyInjection({
			'NoDep': {
				$class: NoDep
			}
		});
		expect(di.service('NoDep').hello()).toBe('hello');
	});

	it('should create service by constructor with arg', () => {
		var di = new DependencyInjection({
			'NoDep': {
				$class: NoDep,
				$args: [' 0113']
			}
		});
		expect(di.service('NoDep').hello()).toBe('hello 0113');
	});

	it('should create service by passing object service', () => {
		var di = new DependencyInjection(defs);
		expect(di.service('Your.Service').world).toBe('world');
		expect(di.service('My.Service').hello).toBe('hello');
	});

	it('should create service by constructor with dependencies', () => {
		var di = new DependencyInjection(defs);
		expect(di.service('Ctrl').logAll()).toBe('hello world to all');
		expect(di.service('Our.Service').all()).toBe('to all');
	});

	it('should create service by path with dependencies', () => {
		var di = new DependencyInjection(defs);
		expect(di.service('Path.Service').logAll()).toBe('hello world to all');
	});

	it('should create service of same Class as other with other dependencies', () => {
		var di = new DependencyInjection(defs);
		expect(di.service('Ctrl2').logAll()).toBe('hello country to all');
	});

	it('should create service with injected parameter', () => {
		var di = new DependencyInjection(defs);
		expect(di.service('With.Parameter').param).toBe('some parameter injecting');
	});

	it('should add service to container', () => {
		var di = new DependencyInjection(defs);
		var addedService = {
			some: 'property'
		};
		di.addService('added_service', addedService);
		expect(di.service('added_service')).toBe(addedService);
	});
});