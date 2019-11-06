const http = require('http');

const parser = require('../../parser');

const stop = (container_id,wait = 0)=> {
	return new Promise((resolve,reject) => {
		let req = http.request({
			method: 'POST',
			socketPath: '/var/run/docker.sock',
			path: `/containers/${container_id}/stop${wait > 0 ? '?t=' + wait : ''}`
		},async res => {
			let body = null;

			if('content-type' in res.headers && res.headers['content-type'] === 'application/json') {
				body = await parser.json(res);
			} else {
				body = await parser.text(res);
			}

			if(res.statusCode === 204 || res.statusCode === 304) {
				resolve({
					'success': true,
					'returned': body
				});
			} else {
				resolve({
					'success': false,
					'returned': body
				});
			}
		});

		req.on('error',err => reject(err));

		req.end();
	});
};

module.exports = stop;