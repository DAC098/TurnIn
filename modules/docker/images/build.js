const http = require('http');
const fs = require('fs');

const parser = require('../../parser');

/**
 *
 * @param dockerfile_path {string}
 * @param options         {{
 *     dockerfile: string,
 *     labels: Object<string,string>,
 *     t: Array<string>|string,
 *     remote: string
 * }=}
 * @returns {Promise<any>}
 */
const build = async (dockerfile_path,options = {}) => new Promise((resolve,reject) => {
	let query = [];
	let dockerfile_read = fs.createReadStream(dockerfile_path);

	if(options.dockerfile) {
		query.push(`dockerfile=${options.dockerfile}`);
	}

	if(options.labels) {
		query.join(`labels=${JSON.stringify(options.labels)}`);
	}

	if(options.t) {
		if(Array.isArray(options.t)) {
			for(let tag of options.t) {
				query.push(`t=${tag}`);
			}
		} else {
			query.push(`t=${options.t}`);
		}
	}

	let req = http.request({
		method: 'POST',
		socketPath: '/var/run/docker.sock',
		path: `/build${query.length !== 0 ? query.join('&') : ''}`,
		headers: {
			'Content-Type': 'application/x-tar'
		}
	},async res => {
		let body = null;

		if('content-type' in res.headers && res.headers['content-type'] === 'application/json') {
			body = await parser.json(res);
		}

		if(res.statusCode === 200) {
			resolve({
				'success': true,
				'returned': res
			});
		} else {
			resolve({
				'success': false,
				'returned': body
			});
		}
	});

	req.on('error', err => {
		reject(err);
	});

	dockerfile_read.pipe(req);
});

module.exports = build;