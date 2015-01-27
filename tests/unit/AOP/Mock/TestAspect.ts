
export = TestAspect;
class TestAspect {
	static $aspect = 'Mock.TestAspect';

	public isMockTest: string;
	public isIntercepted = false;

	constructor() {
		this.isMockTest = 'MockTest';
	}

	intercept() {
		this.isIntercepted = true;
	}
}