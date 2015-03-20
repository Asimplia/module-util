
import _ = require('underscore');
import fs = require('fs');

export = EnvConfigOverrider;
class EnvConfigOverrider {

	static $aspect = 'Env.EnvConfigOverrider';
	static $service = 'Env.EnvConfigOverrider';
	static $args = [null];
	constructor(
		private basePath: string
	) {}

	intercept() {
		if (!fs.existsSync(this.basePath)) {
			console.warn('Base directory of .env.json configuration not found: ' + this.basePath);
		}
		// override of EnvVar using file
		var envFilePath = this.basePath + '/.env.json';
		if (fs.existsSync(envFilePath)) {
			process.env = _.defaults({}, process.env, require(envFilePath));
		}
	}
}
