
import IClient = require('./IClient');
import IQuery = require('./IQuery');
import QueryCallback = require('./QueryCallback');

export = PostgreClient;
class PostgreClient implements IClient {

	get connectionParameters() { return this.client.connectionParameters; }

	constructor(
		private client: IClient
	) {}

	connect(callback?: (e: Error, client?: IClient) => void) {
		this.client.connect(callback);
	}

	end() {
		this.client.end();
	}

	on(event: string, callback: (data?: any) => void) {
		this.client.on(event, callback);
		return this;
	}

	removeListener(event: string, callback: (data?: any) => void) {
		this.client.removeListener(event, callback);
		return this;
	}

	query(sql: string, args?: any[]|QueryCallback, callback?: QueryCallback): IQuery {
		if (typeof args === 'function') {
			callback = <QueryCallback>args;
			return this.client.query(sql, callback);
		} else {
			return this.client.query(sql, <any[]>args, callback);
		}
	}
}
