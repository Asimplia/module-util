
declare module 'pg' {
	export class Client {
		constructor(options: any);
		connectionParameters: any;
		query(sql: string, callback?: QueryCallback): IQuery;
		query(sql: string, args: any[], callback?: QueryCallback): IQuery;
		connect(callback?: (e: Error, client?: Client) => void);
		end(): void;
		on(event: string, callback: (data?: any) => void): Client;
		removeListener(event: string, listener: (data?: any) => void): Client;
		on(event: 'drain', callback: () => void): Client;
		on(event: 'error', callback: (e: Error) => void): Client;
		on(event: 'notification', callback: (msg: INotificationMessage) => void): Client;
		on(event: 'notice', callback: (msg: any) => void): Client;
	}

	interface IQuery {
		on(event: string, callback: (data: any, result?: IResult) => void): IQuery;
		on(event: 'end', callback: (result: IResult) => void): IQuery;
		on(event: 'row', callback: (row: any, result: IResult) => void): IQuery;
		on(event: 'error', callback: (e: Error) => void): IQuery;
	}

	interface INotificationMessage {
		channel: string;
		length: number;
		processId: number;
		payload: string;
	}

	interface IResult {
		rows: any[];
		command?: string;
		rowCount?: number;
		oid?: string;
	}

	type QueryCallback = (e: Error, result: IResult) => void;
}
