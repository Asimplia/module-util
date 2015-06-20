
import httpStatus = require('http-status');
import CryptoJS = require('crypto-js');
import express = require('express');
import Q = require('q');
import StatusPromise = require('./StatusPromise');
import DateFactory = require('../DateTime/DateFactory');
import _ = require('underscore');
import moment = require('moment');

export = StatusManager;
class StatusManager {

	private promises: {[hash: string]: StatusPromise} = {};
	private startedAt: Date;

	static $service = 'Express.StatusManager';
	static $inject = [
		'express.Express',
		DateFactory,
	];
	constructor(
		private app: express.Application,
		private dateFactory: DateFactory
	) {}

	provide() {
		this.startedAt = this.dateFactory.now();
		this.app.get('/status/:hash', (req: express.Request, res: express.Response) => this.handleStatus(req, res));
		this.app.get('/status', (req: express.Request, res: express.Response) => this.handleStatusAll(req, res));
	}

	bind(promise: Q.Promise<any>) {
		var requestHash = this.generateHash();
		this.promises[requestHash] = new StatusPromise(
			promise,
			'/status/' + requestHash,
			this.dateFactory.now()
		);
		return this.promises[requestHash];
	}

	private handleStatus(req: express.Request, res: express.Response) {
		var requestHash = req.params.hash;
		var promise = this.promises[requestHash];
		if (!promise) {
			return res
			.status(httpStatus.BAD_REQUEST)
			.send({
				message: 'Not found request hash: ' + requestHash
			});
		}
		res.send({
			state: promise.Promise.inspect().state,
			data: promise.Data,
			error: promise.Error,
			startedAt: promise.StartedAt
		});
	}

	private handleStatusAll(req: express.Request, res: express.Response) {
		var promiseInfos = _.map(this.promises, (promise: StatusPromise, hash: string) => {
			return {
				path: '/status/' + hash,
				state: promise.Promise.inspect().state,
				data: promise.Data,
				error: promise.Error,
				startedAt: promise.StartedAt
			};
		});
		var uptime = this.dateFactory.now().valueOf() - this.startedAt.valueOf();
		res.send({
			startedAt: this.startedAt,
			uptime: moment.duration(uptime).humanize(),
			memoryUsage: process.memoryUsage(),
			requests: promiseInfos
		});
	}

	private generateHash() {
		return CryptoJS.MD5('' + (new Date()).valueOf() + Math.random());
	}

}
