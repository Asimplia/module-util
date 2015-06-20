
import httpStatus = require('http-status');
import CryptoJS = require('crypto-js');
import express = require('express');
import Q = require('q');
import StatusPromise = require('./StatusPromise');

export = StatusManager;
class StatusManager {

	private promises: {[hash: string]: StatusPromise} = {};

	static $service = 'Express.StatusManager';
	static $inject = [
		'express.Express',
	];
	constructor(
		private app: express.Application
	) {}

	provide() {
		this.app.get('/status/:hash', (req: express.Request, res: express.Response) => this.handleStatus(req, res));
	}

	bind(promise: Q.Promise<any>) {
		var requestHash = this.generateHash();
		this.promises[requestHash] = new StatusPromise(
			promise,
			'/status/' + requestHash
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
			error: promise.Error
		});
	}

	private generateHash() {
		return CryptoJS.MD5('' + (new Date()).valueOf() + Math.random());
	}

}
