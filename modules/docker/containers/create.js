const http = require('http');

const parseJSON = require('../../parser/json');
const parseText = require('../../parser/text');

/**
 * sends a request the the docker.sock to create a container, follows same
 * options as the one listed in the docker engine api
 * @param name    {string} name of the container
 * @param options {Object} options that follow the docker engine api
 * @returns {Promise<{success:boolean,returned:Object}>}
 */
const create = async (name,options = {}) => new Promise((resolve,reject) => {
	let req = http.request({
		method: 'POST',
		socketPath: '/var/run/docker.sock',
		path: `/containers/create${typeof name === 'string' ? `?name=${name}` : ''}`,
		headers: {
			'Content-Type': 'application/json'
		}
	},async res => {
		let body = null;

		if('content-type' in res.headers && res.headers['content-type'] === 'application/json') {
			body = await parseJSON(res);
		} else {
			body = await parseText(res);
		}

		if(res.statusCode === 201) {
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

	req.on('error',err => {
		reject(err);
	});

	req.write(JSON.stringify(options));
	req.end();
});

module.exports = create;