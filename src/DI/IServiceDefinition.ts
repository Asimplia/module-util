
import IConstructor = require('./IConstructor');

export = IServiceDefinition;
interface IServiceDefinition {
	$path?: string;
	$class?: IConstructor;
	$args?: string[]|Object[];
	$factory?: (...args: any[]) => any;
	$inject?: string[];
	$run?: boolean;
}
