
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
		var _this = this;
		hooker.hook(List.prototype, 'forEach', {
			pre: function (cb: (item: any, i?: number) => any) {
				return _this.handleIterations(this, cb);
			}
		});
	}

	private handleIterations(
		list: List<any, List<any, any>>, 
		defaultCb: (item: any, i?: number) => any
	): any {
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

