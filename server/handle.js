const {URL} = require('url');

const log = require('modules/log');

const router = require('./router');

const handle = async (req,res) => {
	res['endJSON'] = function(obj,cb) {
		this.end(JSON.stringify(obj),cb);
	};

	res['endJSONAsync'] = function(obj) {
		return new Promise((resolve) => {
			this.end(JSON.stringify(obj),() => {
				resolve();
			});
		});
	};

	req.url_parsed = new URL(req.url,`https://${req.headers['host']}:443/`);

	try {
		log.info(`${req.method} ${req.url} HTTP/${req.httpVersion}`);

		let result = await router.run(req,res);

		if(!result.found_path) {
			log.info(`${req.method} ${req.url} HTTP/${req.httpVersion}: not found`);
			res.writeHead(404,{'content-type':'application/json'});
			res.endJSON({
				'message': 'not found'
			});
		} else if(result.found_path && !result.valid_method) {
			log.info(`${req.method} ${req.url} HTTP/${req.httpVersion}: invalid method`);
			res.writeHead(405,{'content-type':'application/json'});
			res.endJSON({
				'message': 'unhandled method'
			});
		}
	} catch(err) {
		log.error(err.stack);
		res.writeHead(500,{'content-type':'application/json'});
		res.endJSON({
			'message': 'server error'
		});
	}
};

module.exports = handle;
