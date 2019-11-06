const http = require('http');
const fs = require('fs');

const pump = require('../../streaming/asyncPump');

const parser = require('../../parser');

const fetchArchive = (container_id,extract_path,ostream) => {
	return new Promise((resolve,reject) => {
		let req = http.request({
			method: 'GET',
			socketPath: '/var/run/docker.sock',
			path: `/containers/${container_id}/archive?path=${extract_path}`
		}, async res => {
			let body = null;

			if('content-type' in res.headers && res.headers['content-type'] === 'application/json') {
				body = await parser.json(res);
			}

			if(res.statusCode === 200) {
				try {
					await pump(res,ostream);

					resolve({
						'success': true,
						'returned': null
					});
				} catch(err) {
					reject(err);
				}
			} else {
				resolve({
					'success': false,
					'returned': body
				});
			}
		});

		req.on('error', err => reject(err));

		req.end();
	});
};

const toPath = async (container_id,extract_path,output_path) => {
	let write_stream = fs.createWriteStream(output_path);

	return await fetchArchive(container_id,extract_path,write_stream);
};

exports.toPath = toPath;

const toStream = async (container_id,extract_path,ostream) => {
	return await fetchArchive(container_id,extract_path,ostream);
};

exports.toStream = toStream;