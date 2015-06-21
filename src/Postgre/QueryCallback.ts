
import IResult = require('./IResult');

export = QueryCallback;
type QueryCallback = (e: Error, result: IResult) => void;
