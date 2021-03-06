﻿
import express = require('express');

export = ParamDefinition;
class ParamDefinition {
	public static datetime(req: express.Request, res: express.Response, next: (e?: Error) => void, datetime: string) {
		/* tslint:disable */
		var regex = /^([\+-]?\d{4}(?!\d{2}\b))((-?)((0[1-9]|1[0-2])(\3([12]\d|0[1-9]|3[01]))?|W([0-4]\d|5[0-2])(-?[1-7])?|(00[1-9]|0[1-9]\d|[12]\d{2}|3([0-5]\d|6[1-6])))([T\s]((([01]\d|2[0-3])((:?)[0-5]\d)?|24\:?00)([\.,]\d+(?!:))?)?(\17[0-5]\d([\.,]\d+)?)?([zZ]|([\+-])([01]\d|2[0-3]):?([0-5]\d)?)?)?)?$/;
		/* tslint:enable */
		if (!datetime.match(regex)) {
			next(new Error('Wrong input parameter'));
		}
		next();
	}

	public static regex(regex: RegExp) {
		return (req: express.Request, res: express.Response, next: (e?: Error) => void, datetime: string) => {
			if (!datetime.match(regex)) {
				return next(new Error('Wrong input parameter'));
			}
			next();
		};
	}
}
