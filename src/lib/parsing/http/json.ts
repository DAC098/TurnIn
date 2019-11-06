const parseJSON = <ReturnJSON = {}>(stream: any): Promise<ReturnJSON|null> => new Promise((resolve,reject) => {
	if(stream.readable) {
		let body = '';

		stream.on('data', chunk => {
			body += chunk;
		});

		stream.on('end', () => {
			try {
				if(body.length)
					resolve(JSON.parse(body));
				else
					resolve(({} as ReturnJSON));
			} catch(err) {
				reject(err);
			}
		});

		stream.on('error', err => {
			reject(err);
		});

		if(stream.isPaused())
			stream.resume();
	} else {
		resolve(null);
	}
});

export default parseJSON;
