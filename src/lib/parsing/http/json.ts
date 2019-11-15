const parseJSON = <ReturnJSON = {}>(stream: NodeJS.ReadableStream) => new Promise<ReturnJSON|null>((resolve,reject) => {
	if(stream.readable) {
		const error_handle = (err) => {
			reject(err);
		};
		
		stream.once('error', error_handle);

		stream.once("readable",() => {
			let data = "";
			let chunk = null;

			while (null != (chunk = stream.read())) {
				data += chunk;
			}

			try {
				if (data.length > 0) {
					resolve(JSON.parse(data));
				}
				else {
					resolve(<ReturnJSON>{})
				}
			}
			catch(err) {
				reject(err);
			}

			stream.removeListener("error",error_handle);
		});
	} else {
		resolve(null);
	}
});

export default parseJSON;
