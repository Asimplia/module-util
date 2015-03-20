
export = Ctrl;
class Ctrl {
	static $inject = ['My.Service', 'Your.Service', 'Our.Service'];
	constructor(
		private my,
		private your,
		private our
	) {}

	logAll() {
		return this.my.hello + ' ' + this.your.world + ' ' + this.our.all();
	}
}
