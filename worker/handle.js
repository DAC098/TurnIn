const {URL} = require('url');
const process = require('process');

const _ = require('lodash');

const log = require('modules/log');

const router = require('./router');

const is_dev = process.env.NODE_ENV === 'development';

const handle = async (req,res) => {
	res['endAsync'] = function(data) {
		return new Promise((resolve,reject) => {
			this.end(data,() => {
				resolve();
			});
		});
	};

	res['endJSON'] = function(...args) {
		let obj = {};
		let status = 200;
		let headers = {'content-type':'application/json'};

		if(args.length === 1) {
			if(typeof args[0] === 'number') {
				status = args[0];
			} else {
				obj = args[0];
			}
		}

		if(args.length === 2) {
			status = args[0];
			obj = args[1];
		}

		if(args.length === 3) {
			status = args[0];
			headers = _.merge({},headers,args[1]);
			obj = args[2];
		}

		if(!this.headersSent) {
			this.writeHead(status,headers);
		}

		return new Promise((resolve) => {
			this.end(JSON.stringify(obj),() => {
				resolve();
			});
		});
	};

	res['endError'] = async function(err,msg) {
		let send = {
			'message': msg || 'server error'
		};

		if(is_dev) {
			send['stack'] = err.stack;
		}

		log.error(err.stack);

		this.writeHead(500,{'content-type':'application/json'});
		await this.endJSON(send);
	};

	req.url_parsed = new URL(req.url,`https://${req.headers['host']}:443/`);

	try {
		log.info(`${req.method} ${req.url} HTTP/${req.httpVersion}`);

		let result = await router.run(req,res);

		if(!result.found_path) {
			log.info(`${req.method} ${req.url} HTTP/${req.httpVersion}: not found`);
			await res.endJSON(404,{
				'message': 'not found'
			});
		} else if(result.found_path && !result.valid_method) {
			log.info(`${req.method} ${req.url} HTTP/${req.httpVersion}: invalid method`);
			await res.endJSON(405,{
				'message': 'unhandled method'
			});
		}
	} catch(err) {
		await res.endError(err);
	}
};

module.exports = handle;
