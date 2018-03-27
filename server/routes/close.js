const process = require('process');

const isJsonContent = require('modules/middleware/isJsonContent');
const checkUserType = require('modules/security/middleware/checkUserType');
const parseJson = require('modules/parser/json');

const server = require('../main');

const checkCacheWithList = list => {
	for(let file of list) {
		if(file in require.cache) {
			return true;
		}
	}

	return false;
};

module.exports = [
	[
		{
			path   : '/close',
			methods: 'post'
		},
		isJsonContent(),
		checkUserType('master'),
		async (req, res) => {
			let body = await parseJson(req);
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
					res.writeHead(200, {'content-type': 'application/json'});

					if((Array.isArray(body.file_update) && checkCacheWithList(body.file_update)) ||
						(typeof body.file_update === 'string' && body.file_update in require.cache)
					) {
						await res.endJSON({
							'message': msg
						});

						if(force_close)
							process.exit(0);
						if(!prevent_close)
							await server.closeAndExit();
					} else {
						await res.endJSON({
							'message': 'non server file, not closing server'
						});
					}
				} else {
					await res.endJSON({
						'message': msg
					});

					if(force_close)
						process.exit(0);
					else if(!prevent_close)
						await server.closeAndExit();
				}
			} else {
				await res.endJSON({
					'message': msg
				});

				if(force_close)
					process.exit(0);
				else if(!prevent_close)
					await server.closeAndExit();
			}
		}
	]
];
