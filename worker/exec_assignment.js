const http = require("http");
const n_fs = require('fs');
const n_path = require('path');

const containers = require('modules/docker/containers');
const setup = require('modules/setup');
const log = require('modules/log');

const request = (method,path,body,head) => new Promise((resolve,reject) => {
	let headers = {};

	if(head) {
		headers = {...head};
	}

	if(body) {
		headers['Content-Type'] = 'application/json';
	}

	const req = http.request({
		method: method.toUpperCase(),
		socketPath: '/var/run/docker.sock',
		path: path,
		headers
	}, res => {
		resolve(res);
	});

	req.on('upgrade',(res,socket,head) => {
		resolve({res,socket,head});
	});

	req.on('error',err => {
		reject(err);
	});

	if(body) {
		req.write(JSON.stringify(body));
	}

	req.end();
});

const getBody = res => new Promise((resolve,reject) => {
	let rtn = '';

	res.on('data', chunk => {
		rtn += chunk;
	});

	res.on('error',e => {
		reject(e);
	});

	res.on('end',() => {
		resolve(rtn);
	});
});

(async () => {
	for(let arg of process.argv) {
		console.log(`arg:"${arg}"`);
	}

	let container_id = '';
	let created_container = false;

	try {
		console.log('creating ubuntu container');

		let result = await containers.create(null,{

		})
	} catch(err) {
		console.error(err.stack);
	}

	try {
		console.log('starting container');

		let res = await request('post',`/containers/${container_id}/start`);

		if(res.statusCode === 204 || res.statusCode === 304) {
			console.log('container started');
		} else {
			let body = JSON.parse(await getBody(res));
			console.log('statusCode',res.statusCode);
			console.log('body',body);
		}
	} catch(err) {
		console.error(err.stack);
	}

	let soc = null;

	try {
		console.log('attaching to container');

		let res = await request('post',`/containers/${container_id}/attach?logs=true&stdout=true&stderr=true&stream=true&stdin=true`,null,{
			Upgrade: 'tcp',
			Connection: 'Upgrade'
		});

		if(res.socket) {
			console.log('statusCode',res.res.statusCode);
			console.log('headers',res.res.headers);
			console.log('head?',res.head.toString());

			let attach_file = n_fs.createWriteStream(n_path.join(__dirname,`outputs/exec_attach_${container_id.substr(0,12)}.txt`),{
				flags: 'w',
				encoding: 'utf8'
			});
			let {socket} = res;

			socket.writeP = (data,encoding) => new Promise((resolve,reject) => {
				socket.write(data,encoding,() => {
					resolve();
				});
			});

			socket.on('connect',() => {
				console.log('socket connected');
			});

			socket.on('close',async had_err => {
				console.log('socket closed',{had_err});

				try {
					console.log('stoping container');

					let res = await request('post',`/containers/${container_id}/stop`);

					if(res.statusCode === 204 || res.statusCode === 304) {
						console.log('container stopped');
					} else {
						let body = JSON.parse(await getBody(res));
						console.log('statusCode',res.statusCode);
						console.log('body',body);
					}
				} catch(err) {
					console.error(err.stack);
				}

				try {
					console.log('deleteing container');

					let res = await request('delete',`/containers/${container_id}`);

					if(res.statusCode === 204) {
						console.log('cotnainer deleted');
					} else {
						let body = JSON.parse(await getBody(res));
						console.log('statusCode',res.statusCode);
						console.log('body',body);
					}
				} catch(err) {
					console.error(err.stack);
				}
			});

			socket.on('data',chunk => {
				process.stdout.write(`${chunk.toString()}`);
				attach_file.write(chunk.toString());
			});

			socket.on('drain',() => {
				console.log('socket drained');
			});

			socket.on('end',() => {
				console.log('socket end');
			});

			socket.on('error',err => {
				console.error(err.stack);
			});

			socket.on('lookup',(err,address,family,host) => {
				console.log('socket lookup',{err,address,family,host});
			});

			soc = socket;

			socket.resume();

			await socket.writeP('ls -val\n');

			// await wait(2000);

			await socket.writeP(`echo 'i am a fish'\n`);
		} else {
			console.log('statusCode',res.statusCode);
			console.log('body',await getBody(res));
		}
	} catch(err) {
		console.error(err.stack);
	}

	let exec_id = '';
	let exec_output_file = n_path.join(__dirname,`/outputs/exec_output_${container_id.substr(0,12)}.txt`);
	let exec_output_stream = n_fs.createWriteStream(exec_output_file,{
		flags: 'w',
		encoding: 'utf8'
	});

	try {
		console.log('creating exec instance');

		let res = await request('post',`/containers/${container_id}/exec`,{
			AttachStdout: true,
			AttachStderr: true,
			Tty: true,
			Cmd: ['/bin/sh','-c','ls -val | grep tmp']
		});

		if(res.statusCode === 201) {
			let body = JSON.parse(await getBody(res));
			console.log('exec instance',body.Id);
			exec_id = body.Id;
		} else {
			console.log('statusCode',res.statusCode);
			console.log('body',JSON.parse(await getBody(res)));
		}
	} catch(err) {
		console.error(err.stack);
	}

	try {
		let res = await request('post',`/exec/${exec_id}/start`,{
			Tty: true,
			AttachStdin: true,
			AttachStdout: true,
			AttachStderr: true
		});

		let body = await getBody(res);

		exec_output_stream.write(body);

		console.log('statusCode',res.statusCode);
		console.log('body',body);
	} catch(err) {
		console.error(err.stack);
	}

	try {
		console.log('creating exec instance');

		let res = await request('post',`/containers/${container_id}/exec`,{
			AttachStdout: true,
			AttachStderr: true,
			Tty: true,
			Cmd: ['/bin/sh','-c','ls -val']
		});

		if(res.statusCode === 201) {
			let body = JSON.parse(await getBody(res));
			console.log('exec instance',body.Id);
			exec_id = body.Id;
		} else {
			console.log('statusCode',res.statusCode);
			console.log('body',JSON.parse(await getBody(res)));
		}
	} catch(err) {
		console.error(err.stack);
	}

	try {
		let res = await request('post',`/exec/${exec_id}/start`,{
			Tty: true,
			AttachStdin: true,
			AttachStdout: true,
			AttachStderr: true
		});

		let body = await getBody(res);

		exec_output_stream.write(body);

		console.log('statusCode',res.statusCode);
		console.log('body',body);
	} catch(err) {
		console.error(err.stack);
	}

	try {
		console.log('getting contaienr logs');

		let res = await request('get',`/containers/${container_id}/logs?stderr=true&stdout=true`);

		let body = await getBody(res);

		console.log('statusCode',res.statusCode);
		console.log('body',body);

		if(soc)
			await soc.writeP('exit\n');
	} catch(err) {
		console.error(err.stack);
	}

})();
