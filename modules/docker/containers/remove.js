const http = require('http');

const parser = require('../../parser');

const remove = (container_id,v,force,link) => {
	return new Promise((resolve,reject) => {
		let path = `/containers/${container_id}`;
		let add_query = true;

		if(typeof v === 'boolean') {
			add_query = false;
			path += '?v=true';
		}

		if(typeof force === 'boolean') {
			path += add_query ? '?force=true' : '&force=true';
			add_query = false;
		}

		if(typeof link === 'boolean') {
			path += add_query ? '?link=true' : '&link=true';
		}

		let req = http.request({
			method: 'DELETE',
			socketPath: '/var/run/docker.sock',
			path
		},async res => {
			let body = null;

			if('content-type' in res.headers && res.headers['content-type'] === 'application/json') {
				body = await parser.json(res);
			} else {
				body = await parser.text(res);
			}

			if(res.statusCode === 204) {
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

module.exports = remove;