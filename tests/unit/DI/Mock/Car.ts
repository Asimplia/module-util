
import Wheel = require('./Wheel');

export = Car;
class Car {
	static $service = 'Mock.Car';
	static $args = ['Bently'];
	static $inject = [Wheel];
	constructor(
		public name: string,
		public wheel: Wheel
	) {}
}
