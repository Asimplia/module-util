
import moment = require('moment');

export = DateFactory;
class DateFactory {

	now() {
		return moment().toDate();
	}

}
