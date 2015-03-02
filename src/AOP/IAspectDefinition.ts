
import IAspect = require('./IAspect');

export = IAspectDefinition;
interface IAspectDefinition {
	$aspect?: any|IAspect;
	$method?: string;
	$interceptor?: Function;
}
