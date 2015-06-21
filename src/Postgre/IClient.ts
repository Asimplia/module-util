
import QueryCallback = require('./QueryCallback');
import IQuery = require('./IQuery');
import INotificationMessage = require('./INotificationMessage');

export = IClient;
interface IClient {
	connectionParameters: any;
	query(sql: string, callback?: QueryCallback): IQuery;
	query(sql: string, args: any[], callback?: QueryCallback): IQuery;
	connect(callback?: (e: Error, client?: IClient) => void);
	end(): void;
	on(event: string, callback: (data?: any) => void): IClient;
	removeListener(event: string, listener: (data?: any) => void): IClient;
	on(event: 'drain', callback: () => void): IClient;
	on(event: 'error', callback: (e: Error) => void): IClient;
	on(event: 'notification', callback: (msg: INotificationMessage) => void): IClient;
	on(event: 'notice', callback: (msg: any) => void): IClient;
}
