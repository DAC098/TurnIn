const parser = require('modules/parser');

const isJsonContent = require('modules/middleware/isJsonContent');

const server = require('../main');
const router = require('../router');

const checkCacheWithList = list => {
	for(let file of list) {
		if(file in require.cache) {
			return true;
		}
	}

	return false;
};

router.addRoute({path:'/close',methods:'post'},isJsonContent(true),async (req,res) => {
	let body = await parser.json(req);
	let prevent_close = req.url_parsed.searchParams.has('no_close');
	let force_close = req.url_parsed.searchParams.has('force_close');
	let msg = '';

	if(force_close)
		msg = 'force closing server';
	else if(prevent_close)
		msg = 'holding on close';
	else
		msg = 'closing server';

	if(body) {
		if(typeof body.file_update !== 'undefined') {
			if((Array.isArray(body.file_update) && checkCacheWithList(body.file_update)) ||
				(typeof body.file_update === 'string' && body.file_update in require.cache)
			) {
				await res.endJSON(202,{
					'message': msg
				});

				if(force_close) {
					process.exit(0);
				}

				if(!prevent_close) {
					await server.shutdown();
					process.exit(0);
				}
			} else {
				await res.endJSON(400,{
					'message': 'non server file, not closing server'
				});
			}
		} else {
			await res.endJSON(202,{
				'message': msg
			});

			if(force_close) {
				process.exit(0);
			}

			if(!prevent_close) {
				await server.shutdown();
				process.exit(0);
			}
		}
	} else {
		await res.endJSON(202,{
			'message': msg
		});

		if(force_close) {
			process.exit(0);
		}

		if(!prevent_close) {
			await server.shutdown();
			process.exit(0);
		}
	}
});