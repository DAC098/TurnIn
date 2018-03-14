const {URL} = require('url');
const process = require('process');

const log = require('modules/log');

const router = require('./router');

const is_dev = process.env.NODE_ENV === 'development';

const handle = async (req,res) => {
	res['endJSONSync'] = function(obj,cb) {
		this.end(JSON.stringify(obj),cb);
	};

	res['endJSON'] = function(obj) {
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

		this.writeHead(500,{'content-type':'application/json'});
		await this.endJSON(send);
	};

	req.url_parsed = new URL(req.url,`https://${req.headers['host']}:443/`);

	try {
		log.info(`${req.method} ${req.url} HTTP/${req.httpVersion}`);

		let result = await router.run(req,res);

		if(!result.found_path) {
			log.info(`${req.method} ${req.url} HTTP/${req.httpVersion}: not found`);
			res.writeHead(404,{'content-type':'application/json'});
			await res.endJSON({
				'message': 'not found'
			});
		} else if(result.found_path && !result.valid_method) {
			log.info(`${req.method} ${req.url} HTTP/${req.httpVersion}: invalid method`);
			res.writeHead(405,{'content-type':'application/json'});
			await res.endJSON({
				'message': 'unhandled method'
			});
		}
	} catch(err) {
		log.error(err.stack);
		await res.endError(err);
	}
};

module.exports = handle;
