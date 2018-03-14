const url = require('url');
const path = require('path');
const fs = require('fs');

const mime = require("mime");

const File = require('modules/fs/File');
const asyncPump = require('modules/streaming/asyncPump');
const log = require('modules/log');

const cwd = process.cwd();

module.exports = [
	[
		{
			path: '/assets/:path*',
			methods: 'get'
		},
		async (req,res) => {
			let parsed = url.parse(req.url);
			let file_path = path.join(cwd,parsed.pathname);

			if(await File.exists(file_path)) {
				res.writeHead(200,{'content-type':mime.getType(path.extname(file_path))});

				try {
					let file_stream = fs.createReadStream(file_path);

					await asyncPump(file_stream,res);
					res.end();
				} catch(err) {
					log.error(err.stack);
					if(res.headersSent) {
						res.end();
					} else {
						await res.endError(err,'something went wrong when sending the file');
					}
				}
			} else {
				res.writeHead(404,{'content-type':'application/json'});
				await res.endJSON({
					'message': 'file not found'
				});
			}
		}
	]
];