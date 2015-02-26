
import Util = require('../../../src/index');
import EnvConfigOverrider = Util.Env.EnvConfigOverrider;

describe('Env.EnvConfigOverrider', () => {

	it('should override process.env variables from .env.json in specified basePath if empty', () => {
		delete process.env.OVERRODE_VAR;
		var envConfigOverrider = new EnvConfigOverrider(__dirname + '/../../../../tests/unit/Env/fixtures');
		envConfigOverrider.intercept();
		expect(process.env.OVERRODE_VAR).toBe('is not foo');
	});

	it('should override process.env variables from .env.json in specified basePath if undefined', () => {
		process.env.OVERRODE_VAR = undefined;
		var envConfigOverrider = new EnvConfigOverrider(__dirname + '/../../../../tests/unit/Env/fixtures');
		envConfigOverrider.intercept();
		expect(process.env.OVERRODE_VAR).toBe('is not foo');
	});

	it('should not override process.env variables from .env.json if specified already', () => {
		process.env.OVERRODE_VAR = 'foo';
		var envConfigOverrider = new EnvConfigOverrider(__dirname + '/../../../../tests/unit/Env/fixtures');
		envConfigOverrider.intercept();
		expect(process.env.OVERRODE_VAR).toBe('foo');
	});

	it('should not override process.env variables from .env.json if null. null is correct value', () => {
		process.env.OVERRODE_VAR = null;
		var envConfigOverrider = new EnvConfigOverrider(__dirname + '/../../../../tests/unit/Env/fixtures');
		envConfigOverrider.intercept();
		expect(process.env.OVERRODE_VAR).toBeNull();
	});
});
