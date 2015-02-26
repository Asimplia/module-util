
import moment = require('moment');
import DateFactory = require('../DateTime/DateFactory');

export = LogPrefixer;
class LogPrefixer {

	private colors = {
		log: [34, 39], // blue
		info: [32, 39], // green
		error: [31, 39], // red
		warn: [33, 39], // yellow
		debug: [35, 39], // magenta
	};

	static $aspect = 'Console.LogPrefixer';
	static $service = 'Console.LogPrefixer';
	static $inject = [
		DateFactory
	];
	constructor(
		private dateFactory: DateFactory
	) {}
	
	intercept() {
		var _this = this;
		Object.keys(this.colors).forEach((name: string) => {
			var color = _this.colors[name];
			var defaultFunction = console[name];
			console[name] = function (...args: any[]) {
				var formatedDate = moment(_this.dateFactory.now())
					.format('YYYY-MM-DD\xA0HH:mm:ss');
				args.unshift(
					_this.start(color) + formatedDate + _this.end(color)
				);
				defaultFunction.apply(this, args);
			};
		});
	}

	private start(color: number[]) {
		return "\033[" + color[0] + "m";
	}

	private end(color: number[]) {
		return "\033[" + color[1] + "m";
	}
}
