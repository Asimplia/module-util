
import Util = require('../../../src/index');
import AspectInterception = Util.AOP.AspectInterception;

describe('AOP.AspectInterception', () => {

	it('should apply aspect by simple IAspect object', () => {
		var ran = false;
		var myAspect = {
			intercept: () => {
				ran = true;
			}
		};
		var ai = new AspectInterception('asimplia-util', {
			'My.Aspect': myAspect
		});
		expect(ran).toBeTruthy();
	});

	it('should apply aspect by IAspectDefinition', () => {
		var ran = false;
		var myAspect = {
			intercept: () => {
				ran = true;
			}
		};
		var ai = new AspectInterception('asimplia-util', {
			'My.Aspect': {
				$aspect: myAspect
			}
		});
		expect(ran).toBeTruthy();
	});

	it('should apply aspect by IAspectDefinition with $method', () => {
		var ran = false;
		var ranIntercept = false;
		var myAspect = {
			intercept: () => {
				ranIntercept = true;
			},
			otherIntercept: () => {
				ran = true;
			}
		};
		var ai = new AspectInterception('asimplia-util', {
			'My.Aspect': {
				$aspect: myAspect,
				$method: 'otherIntercept'
			}
		});
		expect(ranIntercept).toBeFalsy();
		expect(ran).toBeTruthy();
	});

	it('should apply aspect by IAspectDefinition with $interceptor', () => {
		var ran = false;
		var ranIntercept = false;
		var myAspect = {
			intercept: () => {
				ranIntercept = true;
			},
			otherIntercept: () => {
				ran = true;
			}
		};
		var ai = new AspectInterception('asimplia-util', {
			'My.Aspect': {
				$interceptor: myAspect.otherIntercept
			}
		});
		expect(ranIntercept).toBeFalsy();
		expect(ran).toBeTruthy();
	});

	it('should apply aspect by with static annotation $method', () => {
		var ran = false;
		var ranIntercept = false;
		function MyAspect() {
			this.intercept = () => {
				ranIntercept = true;
			};
			this.otherIntercept = () => {
				ran = true;
			};
		}
		(<any>MyAspect).$method = 'otherIntercept';
		var myAspect = new MyAspect();
		var ai = new AspectInterception('asimplia-util', {
			'My.Aspect': myAspect
		});
		expect(ranIntercept).toBeFalsy();
		expect(ran).toBeTruthy();
	});

	it('should apply aspect by default $interceptor with static annotation $interceptor which is not called', () => {
		var ran = false;
		var ranIntercept = false;
		var ranInterceptor = false;
		function MyAspect() {
			this.intercept = () => {
				ranIntercept = true;
			};
			this.otherIntercept = () => {
				ran = true;
			};
		}
		var interceptor = (<any>MyAspect).$interceptor = () => {
			ranInterceptor = true;
		};
		var myAspect = new MyAspect();
		var ai = new AspectInterception('asimplia-util', {
			'My.Aspect': {
				$interceptor: interceptor
			}
		});
		expect(ranIntercept).toBeFalsy();
		expect(ran).toBeFalsy();
		expect(ranInterceptor).toBeTruthy();
	});
});