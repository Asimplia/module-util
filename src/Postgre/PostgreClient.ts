
import pg = require('pg');
import IClient = require('./IClient');
import IQuery = require('./IQuery');
import QueryCallback = require('./QueryCallback');

export = PostgreClient;
class PostgreClient implements IClient {

	private lastConnection: IClient;
	private connectionsLimit: number = 10;
	private connections: IClient[] = [];

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

	query(sql: string, params?: any[]|QueryCallback, callback?: QueryCallback): IQuery {
		if (this.connections.length > this.connectionsLimit) {
			return this.getConnection().query(sql, <any[]>params, callback);
		}
		var connection = this.addConnection();
		var args: any[] = [sql];
		if (typeof params !== 'undefined') {
			args.push(params);
		}
		if (typeof callback !== 'undefined') {
			args.push(callback);
		}
		var query = connection.query.apply(connection, args);
		connection.on('drain', () => this.removeConnection(connection));
		return query;
	}

	private addConnection() {
		var connection = new pg.Client(this.client.connectionParameters);
		connection.connect((e: Error, connection?: IClient) => {
			if (e) throw e;
			this.connections.push(connection);
		});
		return connection;
	}

	private getConnection() {
		var connection = this.connections[0];
		this.connections.forEach((nextConnection: IClient, i: number) => {
			if (nextConnection === this.lastConnection) {
				if (typeof this.connections[i + 1] === 'undefined') {
					connection = this.connections[0];
				} else {
					connection = this.connections[i + 1];
				}
			}
		});
		this.lastConnection = connection;
		return connection;
	}

	private removeConnection(connection: IClient) {
		this.connections.splice(this.connections.indexOf(connection), 1);
		connection.end();
	}
}
