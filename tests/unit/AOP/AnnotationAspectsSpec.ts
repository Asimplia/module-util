
import Util = require('../../../src/index');
import AspectInterception = Util.AOP.AspectInterception;
import AnnotationAspects = Util.AOP.AnnotationAspects;
import DependencyInjection = Util.DependencyInjection;

describe('AOP.AnnotationAspects', () => {

	it('should find $aspect annotated service in path and add to AspectInterception', () => {
		var di = new DependencyInjection('asimplia-util', {
			'Mock.TestAspect': require('./Mock/TestAspect'),
			'AOP.AspectInterception': {
				$factory: (di: DependencyInjection) => {
					var ai = new AspectInterception('asimplia-util', {});
					var aa = new AnnotationAspects(__dirname + '/Mock/', ai, di);
					ai.addAspect('AOP.AnnotationAspects', aa);
					return ai;
				},
				$inject: ['DependencyInjection']
			}
		});
		var ai: AspectInterception = di.service('AOP.AspectInterception');

		var mockTestAspect = di.service('Mock.TestAspect');
		expect(mockTestAspect.isMockTest).toBe('MockTest');
		expect(mockTestAspect.isIntercepted).toBeTruthy();
	});
});
