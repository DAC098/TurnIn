const http = require('http');

const parser = require('../../parser');

const make = (container_id,options = {}) => new Promise((resolve,reject) => {
	let req = http.request({
		method: 'POST',
		socketPath: '/var/run/docker.sock',
		path: `/containers/${container_id}/exec`,
		headers: {
			'Content-Type': 'application/json'
		}
	},async res => {
		let body = await parser.json(res);

		resolve({
			success: res.statusCode === 201,
			returned: body
		});
	});

	req.on('error',err => {
		reject(err);
	});

	req.write(JSON.stringify(options));

	req.end();
});

module.exports = make;