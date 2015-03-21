/* tslint:disable:no-unused-variable */
import Util = require('../../../src/index');
import DependencyInjection = Util.DI.DependencyInjection;
import Ctrl = require('./MockCtrl');

var my = { hello: 'hello' };

var your = { world: 'world', to: 'to' };
/* tslint:disable:variable-name */
var Our = function (your: any) {
	this.all = function () {
		return your.to + ' all';
	};
};
(<any>Our).$inject = ['Your.Service'];
/* tslint:enable:variable-name */

class NoDep {
	constructor(private arg1: string = '') {}

	hello() { return 'hello' + this.arg1; }
}

class Factoried {
	constructor(public your: any, public ctrl: Ctrl) {}
}

module With {
	'use strict';

	export class Parameter {
		static $inject = ['parameter.name'];
		constructor(public param: string) {}
	}
}

class Wheel {
	public pneu = true;
}
class Car {
	static $args = ['Bently'];
	static $inject = [Wheel];
	constructor(public name: string, public wheel: Wheel) {}
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
			return new Factoried(your, ctrl);
		},
		$inject: ['Ctrl', 'Your.Service']
	},
	'Path.Service': {
		$path: __dirname + '/MockCtrl'
	},
	'Ctrl2': {
		$class: Ctrl,
		$inject: ['My.Service', 'Your2.Service', 'Our.Service']
	},
	'With.Parameter': With.Parameter
};

describe('DependencyInjection', () => {

	it('should create service by constructor simple', () => {
		var di = new DependencyInjection('asimplia-util', {
			'NoDep': NoDep
		});
		expect(di.service('NoDep').hello()).toBe('hello');
	});

	it('should create service by constructor', () => {
		var di = new DependencyInjection('asimplia-util', {
			'NoDep': {
				$class: NoDep
			}
		});
		expect(di.service('NoDep').hello()).toBe('hello');
	});

	it('should create service by constructor with arg', () => {
		var di = new DependencyInjection('asimplia-util', {
			'NoDep': {
				$class: NoDep,
				$args: [' 0113']
			}
		});
		expect(di.service('NoDep').hello()).toBe('hello 0113');
	});

	it('should create service by passing object service', () => {
		var di = new DependencyInjection('asimplia-util', defs);
		expect(di.service('Your.Service').world).toBe('world');
		expect(di.service('My.Service').hello).toBe('hello');
	});

	it('should create service by constructor with dependencies', () => {
		var di = new DependencyInjection('asimplia-util', defs);
		expect(di.service('Ctrl').logAll()).toBe('hello world to all');
		expect(di.service('Our.Service').all()).toBe('to all');
	});

	it('should create service by path with dependencies', () => {
		var di = new DependencyInjection('asimplia-util', defs);
		expect(di.service('Path.Service').logAll()).toBe('hello world to all');
	});

	it('should create service of same Class as other with other dependencies', () => {
		var di = new DependencyInjection('asimplia-util', defs);
		expect(di.service('Ctrl2').logAll()).toBe('hello country to all');
	});

	it('should create service with injected parameter', () => {
		var di = new DependencyInjection('asimplia-util', defs);
		expect(di.service('With.Parameter').param).toBe('some parameter injecting');
	});

	it('should add service to container', () => {
		var di = new DependencyInjection('asimplia-util', defs);
		var addedService = {
			some: 'property'
		};
		di.addService('added_service', addedService);
		expect(di.service('added_service')).toBe(addedService);
	});

	it('should contains DependencyInjection self in container as service named DependencyInjection', () => {
		var di = new DependencyInjection('asimplia-util', defs);
		expect(di.service('DependencyInjection')).toBe(di);
	});

	it('should contains service in sub DependencyInjection container', () => {
		var subService1 = { sub: 1 };
		var subOur = { sub: 'sub-our' };
		var subDi1 = new DependencyInjection('sub1', {
			sub1_service: subService1,
			'Our.Service': subOur
		});
		var subService2 = { sub: 2 };
		var subService3Named1 = { sub: 3 };
		var subDi2 = new DependencyInjection('sub2', {
			sub2_service: subService2,
			sub1_service: subService3Named1
		});
		var di = new DependencyInjection('asimplia-util', defs, [subDi1, subDi2]);
		expect(di.service('My.Service')).toBe(my);
		expect(di.service('sub1_service')).toBe(subService1);
		expect(di.service('sub2_service')).toBe(subService2);
		expect(di.service('sub2:sub1_service')).toBe(subService3Named1);
		expect(di.service('Our.Service') instanceof Our).toBeTruthy();
		expect(di.service('sub1:Our.Service')).toBe(subOur);
	});

	it('should create service by factory with inject services', () => {
		var di = new DependencyInjection('asimplia-util', defs);
		expect(di.service('Factoried') instanceof Factoried).toBeTruthy();
		expect(di.service('Factoried').ctrl instanceof Ctrl).toBeTruthy();
		expect(di.service('Factoried').your).toBe(your);
	});

	it('should create service by factory with args', () => {
		function A(arg1: any, arg2: any) { this.arg1 = arg1; this.arg2 = arg2; }
		var di = new DependencyInjection('asimplia-util', {
			a: {
				$factory: (arg1: any, arg2: any) => { return new A(arg1, arg2); },
				$args: [1, '2']
			}
		});
		expect(di.service('a').arg1).toBe(1);
		expect(di.service('a').arg2).toBe('2');
	});

	it('should create service by factory with inject & args', () => {
		function A(arg1: any, ser2: any) { this.arg1 = arg1; this.ser2 = ser2; }
		var serv2 = { any: true };
		var di = new DependencyInjection('asimplia-util', {
			a: {
				$factory: (arg1: any, arg2: any) => { return new A(arg1, arg2); },
				$inject: ['serv2'],
				$args: [1]
			},
			serv2: serv2
		});
		expect(di.service('a').arg1).toBe(1);
		expect(di.service('a').ser2).toBe(serv2);
	});

	it('should create service by constructor and inject by class', () => {
		var di = new DependencyInjection('asimplia-util', {
			'NoDep': {
				$class: NoDep
			}
		});
		expect(di.service(NoDep).hello()).toBe('hello');
	});

	it('should create service by constructor and inject by class', () => {
		var emptyStr = true;
		function Dep(noDep: any) { emptyStr = noDep.arg1; };
		var di = new DependencyInjection('asimplia-util', {
			'NoDep': {
				$class: NoDep
			},
			'DepClass': {
				$class: <any>Dep,
				$inject: [NoDep]
			}
		});
		di.service(<any>Dep);
		expect(emptyStr).toBe('');
	});

	it('should create service by constructor and inject by class from sub DI', () => {
		var emptyStr: any = true;
		function Dep(noDep: any) { emptyStr = ''; };
		var subDi = new DependencyInjection('sub-util', {
			'DepClass': {
				$class: <any>Dep
			}
		});
		var di = new DependencyInjection('asimplia-util', {
			'NoDep': {
				$class: NoDep
			}
		}, [
			subDi
		]);
		var dep = di.service(<any>Dep);
		expect(emptyStr).toBe('');
		expect(dep instanceof Dep).toBeTruthy();
	});

	it('should create service by constructor with $inject and $args annotation', () => {
		var di = new DependencyInjection('autosalon', {
			'Bently': Car,
			'Wheel': Wheel
		});
		var car = di.get<Car>(Car);
		expect(car instanceof Car).toBeTruthy();
		expect(car.name).toBe('Bently');
		expect(car.wheel instanceof Wheel).toBeTruthy();
		expect(car.wheel.pneu).toBe(true);
	});

	it('should create service by factory with $inject and $args annotation ignored', () => {
		var di = new DependencyInjection('autosalon', {
			'Bently': {
				$class: Car,
				$factory: (wheel: Wheel) => {
					return new Car('AUDI', wheel);
				},
				$inject: [Wheel]
			},
			'Wheel': Wheel
		});
		var car = di.get<Car>(Car);
		expect(car instanceof Car).toBeTruthy();
		expect(car.name).toBe('AUDI');
		expect(car.wheel instanceof Wheel).toBeTruthy();
		expect(car.wheel.pneu).toBe(true);
	});

	it('should run service automatically by flag $run = true', () => {
		var ran = false;
		function Autorun() {
			ran = true;
		}
		var di = new DependencyInjection('autosalon', {
			'Autorun': {
				$class: Autorun,
				$run: true
			}
		});
		expect(ran).toBeTruthy();
	});

	it('should run service automatically by flag $run = true from $run annotation', () => {
		var ran = false;
		function Autorun() {
			ran = true;
		}
		(<any>Autorun).$run = true;
		var di = new DependencyInjection('autosalon', {
			'Autorun': {
				$class: Autorun
			}
		});
		expect(ran).toBeTruthy();
	});

	it('should not run service automatically by flag $run = true from $run annotation if definition has $run = false', () => {
		var ran = false;
		function Autorun() {
			ran = true;
		}
		(<any>Autorun).$run = true;
		var di = new DependencyInjection('autosalon', {
			'Autorun': {
				$class: Autorun,
				$run: false
			}
		});
		expect(ran).toBeFalsy();
	});

	it('should create service by constructor and inject by class from double-sub DI', () => {
		var emptyStr: any = true;
		function Dep(noDep: any) { emptyStr = ''; };
		var subSubDi = new DependencyInjection('sub-sub-util', {
			'SubDepClass': {
				$class: <any>Dep
			}
		});
		var subDi = new DependencyInjection('sub-util', {
			'DepClass': { any: true }
		}, [subSubDi]);
		var di = new DependencyInjection('asimplia-util', {
			'NoDep': {
				$class: NoDep
			}
		}, [
			subDi
		]);
		var dep = di.service(<any>Dep);
		expect(emptyStr).toBe('');
		expect(dep instanceof Dep).toBeTruthy();
	});
});
