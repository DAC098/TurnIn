const http = require('http');

const pump = require('../../streaming/asyncPump');
const parser = require('../../parser');

const start = (exec_id,options = {},ostream) => new Promise((resolve,reject) => {
	let req = http.request({
		method: 'POST',
		socketPath: '/var/run/docker.sock',
		path: `/exec/${exec_id}/start`,
		headers: {
			'Content-Type': 'application/json'
		}
	},async res => {
		if(res.statusCode === 200) {
			if(typeof ostream !== 'undefined') {
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
				let body = await parser.text(res);

				resolve({
					success: true,
					returned: body
				});
			}
		} else {
			resolve({
				success: false,
				returned: await parser.json(res)
			});
		}
	});

	req.on('error',err => {
		reject(err);
	});

	req.write(JSON.stringify(options));

	req.end();
});

module.exports = start;