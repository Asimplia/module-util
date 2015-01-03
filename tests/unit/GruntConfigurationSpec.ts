
import Util = require('../../src/index');
var GruntConfiguration = Util.GruntConfiguration;

describe("isSubModule", () => {
	var isSubModule = GruntConfiguration.isSubModule;

	it("will return true", () => {
		process.env.PWD = '/any/to/node_modules/asimplia-repository';
		expect(isSubModule()).toBe(true);
		process.env.PWD = '/any/to/node_modules/asimplia-any';
		expect(isSubModule()).toBe(true);
	});

	it("will return false", () => {
		process.env.PWD = '/any/to/node_modules/asimplia-repository/';
		expect(isSubModule()).toBe(false);
		process.env.PWD = '/any/to/asimplia-any';
		expect(isSubModule()).toBe(false);
		process.env.PWD = '/any/to/node_modules/asimplia-repository/any';
		expect(isSubModule()).toBe(false);
	});
});
