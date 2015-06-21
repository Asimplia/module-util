
import IResult = require('./IResult');

export = IQuery;
interface IQuery {
	on(event: string, callback: (data: any, result?: IResult) => void): IQuery;
	on(event: 'end', callback: (result: IResult) => void): IQuery;
	on(event: 'row', callback: (row: any, result: IResult) => void): IQuery;
	on(event: 'error', callback: (e: Error) => void): IQuery;
}
