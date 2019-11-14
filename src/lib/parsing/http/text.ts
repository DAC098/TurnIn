const parseText = (stream: NodeJS.ReadableStream) => new Promise<string>((resolve,reject) => {
	if(stream.readable) {
		const error_handle = err => {
			reject(err);
		}

		stream.once("error", error_handle);

		stream.once("readable", () => {
			let data = "";
			let chunk = null;

			while (null != (chunk = stream.read())) {
				data += chunk;
			}

			resolve(data);

			stream.removeListener("error", error_handle);
		});
	} else {
		resolve(null);
	}
});

export default parseText;
