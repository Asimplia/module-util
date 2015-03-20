
import Util = require('../../../src/index');
import DependencyInjection = Util.DI.DependencyInjection;
import ServiceAutoload = Util.DI.ServiceAutoload;
import AnnotationAspects = Util.AOP.AnnotationAspects;
import AspectInterception = Util.AOP.AspectInterception;
import Car = require('./Mock/Car');
import Wheel = require('./Mock/Wheel');

describe('DependencyInjection', () => {

	it('should create services annotated by $service', () => {
		var di = new DependencyInjection('asimplia-util', {
			'AOP.AnnotationAspects': {
				$class: AnnotationAspects,
				$args: [__dirname + '/../../../src/DI/ServiceAutoload.js']
			},
			'AOP.AspectInterception': {
				$class: AspectInterception,
				$factory: () => {
					return new AspectInterception('asimplia-util', {});
				}
			},
			'DI.ServiceAutoload': {
				$args: [__dirname + '/Mock'],
				$class: ServiceAutoload
			}
		});

		var ai = di.get<AspectInterception>(AspectInterception);
		var aa = di.get<AnnotationAspects>(AnnotationAspects);
		var car = di.get<Car>(Car);
		expect(car instanceof Car).toBeTruthy();
		expect(car.wheel instanceof Wheel).toBeTruthy();
	});
});
