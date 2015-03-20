
import IServiceDefinition = require('./IServiceDefinition');

export = IConstructor;
interface IConstructor extends IServiceDefinition {
	new (...args: any[]): any;
}
