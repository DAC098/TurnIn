const global_router = require('Router/global');

const log = require('modules/log');

const router = require('./router');

log.info('routes:',global_router.routerStructure(router));

const handle = async (req,res) => {
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
		res.writeHead(500,{'content-type':'text/plain'});
		res.end(err.stack);
	}
};

module.exports = handle;
