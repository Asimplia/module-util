
import Q = require('q');
import express = require('express');
import httpStatus = require('http-status');

export = StatusPromise;
class StatusPromise {

	private data: any;
	private error: Error;

	get Promise() { return this.promise; }
	get Data() { return this.data; }
	get Error() { return this.error; }
	get StartedAt() { return this.startedAt; }

	constructor(
		private promise: Q.Promise<any>,
		private asyncPath: string,
		private startedAt: Date
	) {}

	reject(error: Error) {
		this.error = error;
		return this;
	}

	resolve(data: any) {
		this.data = data;
		return this;
	}

	async(res: express.Response) {
		res
		.status(httpStatus.ACCEPTED)
		.send({
			path: this.asyncPath
		});
		return this;
	}
}
