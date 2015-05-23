
import IAspect = require('../../AOP/IAspect');
import List = require('../List');
import hooker = require('hooker');

export = ProgressListLogger;
class ProgressListLogger implements IAspect {

	static $args = [5000];
	constructor(
		private logProgressOverCount: number
	) {}

	intercept() {
		var self = this;
		hooker.hook(List.prototype, 'forEach', {
			pre: function (cb: (item: any, i?: number) => any) {
				return self.handleIterations(this, cb);
			}
		});
		hooker.hook(List.prototype, 'createEach', {
			post: function (each: Each) {
				var defaultOn = each.on;
				each.on = function (eventName: string, cb: (item: any, next: Function) => void) {
					if (eventName == 'item' && each.total >= this.logProgressOverCount) {
						return defaultOn.call(this, eventName, function (item: any, next: Function) {
							if (each.done % (each.total / 100) == 0) {
								var progressPercentage = Math.round(each.done / each.total * 100);
								console.info('Processing of each list is done for ' + progressPercentage + '%');
							}
							return cb.call(this, item, next);
						});
					} else {
						return defaultOn.call(this, eventName, cb);
					}
				};
			}
		});
	}

	private handleIterations(
		list: List<any, List<any, any>>,
		defaultCb: (item: any, i?: number) => any): any {
		var totalCount = list.count();
		if (totalCount < this.logProgressOverCount) {
			return;
		}
		console.info('Started iterating of List with count: ' + totalCount);
		var hookedCallback = (item: any, i?: number): any => {
			var result = defaultCb(item, i);
			if (i % (totalCount / 100) == 0) {
				var progressPercentage = Math.round(i / totalCount * 100);
				console.info('Processing of list is done for ' + progressPercentage + '%');
			}
			return result;
		};
		return hooker.filter(list, [hookedCallback]);
	}
}

