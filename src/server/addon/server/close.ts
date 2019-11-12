import server from "../../server";
import {default as router} from "./router";

// const isJsonContent = require('modules/middleware/isJsonContent');
// const checkUserType = require('modules/security/middleware/checkUserType');

router.addRoute({
	path: "/close",
	methods: ["get","post"]
},async ([stream,headers,flags,data], route_data) => {
	if (server.isClosing()) {
		stream.respond({
			":status": 200,
			"content-type": "application/json"
		});

		stream.end(JSON.stringify({
			message: "closing_in_progress"
		}));
	}
	else {
		stream.respond({
			":status": 200,
			"content-type": "application/json"
		});

		stream.end(JSON.stringify({
			message: "closing_server"
		}));

		await server.close(false);
	}
});
/*
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

			await wkr.updateFiles({
				files: body.file_update,
				prevent_close,
				force_close
			});

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
		}
	]
];
*/