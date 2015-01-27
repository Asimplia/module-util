
import Util = require('../../../src/index');
import AspectInterception = Util.AOP.AspectInterception;
import AnnotationAspects = Util.AOP.AnnotationAspects;
import DependencyInjection = Util.DI.DependencyInjection;
import TestAspect = require('./Mock/TestAspect');

describe('AOP.AnnotationAspects', () => {

	it('should find $aspect annotated service in path and add to AspectInterception', () => {
		var di = new DependencyInjection('asimplia-util', {
			'Mock.TestAspect': TestAspect,
			'AOP.AspectInterception': {
				$class: AspectInterception,
				$factory: () => {
					return new AspectInterception('asimplia-util', {});
				}
			},
			'AOP.AnnotationAspects': {
				$class: AnnotationAspects,
				$factory: (ai: AspectInterception, di: DependencyInjection) => {
					return new AnnotationAspects(__dirname + '/Mock/', ai, di);
				},
				$inject: [AspectInterception, DependencyInjection]
			}
		});
		var aa = di.get<AnnotationAspects>(AnnotationAspects);

		var mockTestAspect = di.get<TestAspect>(TestAspect);
		expect(mockTestAspect.isMockTest).toBe('MockTest');
		expect(mockTestAspect.isIntercepted).toBeTruthy();
	});
});
