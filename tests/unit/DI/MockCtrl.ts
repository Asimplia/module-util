
export = Ctrl;
class Ctrl {
	static $inject = ['My.Service', 'Your.Service', 'Our.Service'];
	constructor(
		private my: any,
		private your: any,
		private our: any
	) {}

	logAll() {
		return this.my.hello + ' ' + this.your.world + ' ' + this.our.all();
	}
}
