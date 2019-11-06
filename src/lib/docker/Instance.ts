import { request, IncomingMessage } from "http"

interface InstanceOptions {}

interface InstanceRequestOptions {
	method: string,
	path: string,
	headers?: {[header: string]: string}
}

declare interface Instance {}

class Instance {

	constructor(options: InstanceOptions) {}

	public createRequest(options: InstanceRequestOptions) {
		return request(options);
	}
	
	public request(options: InstanceRequestOptions) {
		return new Promise<IncomingMessage>((resolve,reject) => {
			let req = this.createRequest(options);

			req.on("response", res => {
				resolve(res);
			});

			req.on("error", err => reject(err));

			req.end();
		});
	}
	
}

export default Instance;