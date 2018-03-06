const path = require('path');

const router = require('./router');
const global_router = require('Router/global');

console.log('routes:',global_router.routerStructure(router));

const handle = async (req,res) => {
  try {
	console.log(`${req.method} ${req.url} HTTP/${req.httpVersion}`);

    let result = await router.run(req,res);

    if(!result.found_path) {
		console.log(`${req.method} ${req.url} HTTP/${req.httpVersion}: not found`);
		res.writeHead(404,{'content-type':'text/plain'});
		res.end('not found');
	} else if(result.found_path && !result.valid_method) {
		console.log(`${req.method} ${req.url} HTTP/${req.httpVersion}: invalid method`);
		res.writeHead(405,{'content-type':'text/plain'});
		res.end(`no handle for method[${req.method}] on url[${req.url}]`);
	}

	} catch(err) {
		console.error(err.stack);
		res.writeHead(500,{'content-type':'text/plain'});
		res.end(err.stack);
	}
}

module.exports = handle;
