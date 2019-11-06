const http = require('http');
const fs = require('fs');

const parser = require('../../parser');
const pump = require('../../streaming/asyncPump');

/**
 *
 * @param dockerfile_path {string}
 * @param options         {{
 *     dockerfile: string,
 *     labels: Object<string,string>,
 *     t: Array<string>|string,
 *     remote: string,
 *     rm: boolean=,
 *     no_cache: boolean=
 * }=}
 * @returns {Promise<any>}
 */
const build = (dockerfile_path,options = {}) => new Promise(async (resolve,reject) => {
	let query = [];
	let dockerfile_read = fs.createReadStream(dockerfile_path);

	if(options.dockerfile) {
		query.push(`dockerfile=${options.dockerfile}`);
	}

	if(typeof options.labels === 'object') {
		query.push(`labels=${JSON.stringify(options.labels)}`);
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

	if(typeof options.rm === 'boolean') {
		query.push(`rm=${options.rm}`);
	}

	if(typeof options.no_cache === 'boolean') {
		query.push(`nocache=${options.no_cache}`);
	}

	let req = http.request({
		method: 'POST',
		socketPath: '/var/run/docker.sock',
		path: `/build${query.length !== 0 ? '?' + query.join('&') : ''}`,
		headers: {
			'Content-Type': 'application/x-tar'
		}
	},async res => {
		if(res.statusCode === 200) {
			resolve({
				'success': true,
				'returned': res
			});
		} else {
			let body = null;

			if('content-type' in res.headers && res.headers['content-type'] === 'application/json') {
				body = await parser.json(res);
			}

			resolve({
				'success': false,
				'returned': body
			});
		}
	});

	req.on('error', err => {
		reject(err);
	});

	await pump(dockerfile_read,req);
});

module.exports = build;