const http = require('http');

const parser = require('../../parser');

const start = (exec_id,options = {}) => new Promise((resolve,reject) => {
	let req = http.request({
		method: 'POST',
		socketPath: '/var/run/docker.sock',
		path: `/exec/${exec_id}/start`,
		headers: {
			'Content-Type': 'application/json'
		}
	},async res => {
		let body = await parser.text(res);

		resolve({
			success: res.statusCode === 200,
			returned: body
		});
	});

	req.on('error',err => {
		reject(err);
	});

	req.write(JSON.stringify(options));

	req.end();
});

module.exports = start;