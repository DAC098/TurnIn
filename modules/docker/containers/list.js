const http = require('http');

const parse = require('../../parser');

const list = (all,limit,size,filter) => {
	let query = [];

	if(typeof all === 'boolean') {
		query.push(`all=${all}`);
	}

	if(typeof limit === 'number') {
		query.push(`limit=${limit}`);
	}

	if(typeof size === 'boolean') {
		query.push(`size=${size}`);
	}

	if(typeof filter === 'object') {
		query.push(`filters=${JSON.stringify(filter)}`);
	}

	return new Promise((resolve,reject) => {
		let req = http.request({
			method: 'GET',
			socketPath: '/var/run/docker.sock',
			path: `/containers/json${query.length !== 0 ? `?${query.join('&')}` : ''}`
		},async res => {
			let body = null;

			if('content-type' in res.headers && res.headers['content-type'] === 'application/json') {
				body = await parse.json(res);
			} else {
				body = await parse.text(res);
			}

			if(res.statusCode === 200) {
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

module.exports = list;