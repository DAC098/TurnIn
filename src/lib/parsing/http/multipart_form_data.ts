const parseMultipartFormData = (read: any,boundary: string): Promise<any|void>  => new Promise((resolve,reject) => {
	if(read.readable) {
		read.on('data',chunk => {
			if(chunk.toString().includes(boundary))
				console.log(`boundary:${chunk.toString()}`);
			console.log('data'.padStart(10,'#'),'\n',chunk.toString());
		});

		read.on('end',() => {
			console.log('end'.padStart(10,'#'));
			resolve(null);
		});

		read.on('error',err => {
			console.error(err.stack);
			reject(err);
		});

		if(read.isPaused())
			read.resume();
	} else {
		resolve(null);
	}
});

export default parseMultipartFormData;