const http = require('http');

const parser = require('../../parser');

const list = (all,filters) => new Promise((resolve,reject) => {
	let query = [];

	if(typeof all === 'boolean') {
		query.push(`all=${all}`);
	}

	if(typeof filters === 'object') {
		query.push(`filters=${JSON.stringify(filters)}`);
	}

	let req = http.request({
		method: 'GET',
		socketPath: '/var/run/docker.sock',
		path: `/images/json${query.length > 0 ? query.join('&') : ''}`
	},async res => {
		let body = await parser.json(res);

		resolve({
			'success': res.statusCode === 200,
			'returned': body
		});
	});

	req.on('error',err => reject(err));

	req.end();
});

module.exports = list;