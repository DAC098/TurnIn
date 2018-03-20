const process = require('process');

const isJsonContent = require('modules/middleware/isJsonContent');
const checkAuthorization = require('modules/security/middleware/checkAuthorization');
const checkUserType = require('modules/security/middleware/checkUserType');
const parseJson = require('modules/parser/json');

const checkCacheWithList = list => {
	for (let file of list) {
		if (file in require.cache) {
			return true;
		}
	}

	return false;
};

module.exports = [
	[
		{
			path: '/close',
			methods: 'post'
		},
		isJsonContent(),
		checkAuthorization,
		checkUserType('master'),
		async (req, res) => {
			let body = await parseJson(req);
			let prevent_close = req.url_parsed.searchParams.has('no_close');

			if (body) {
				if (typeof body.file_update !== 'undefined') {
					res.writeHead(200, {'content-type': 'application/json'});

					if ((Array.isArray(body.file_update) && checkCacheWithList(body.file_update)) ||
						(typeof body.file_update === 'string' && body.file_update in require.cache)
					) {
						await res.endJSON({
							'message': prevent_close ? 'holding on close' : 'closing server'
						});

						if (!prevent_close)
							process.exit(0);
					} else {
						await res.endJSON({
							'message': 'non server file, not closing server'
						});
					}
				} else {
					await res.endJSON({
						'message': prevent_close ? 'holding on close' : 'closing server'
					});

					if (!prevent_close)
						process.exit(0);
				}
			} else {
				await res.endJSON({
					'message': prevent_close ? 'holding on close' : 'closing server'
				});

				if (!prevent_close)
					process.exit(0);
			}
		}
	]
];
