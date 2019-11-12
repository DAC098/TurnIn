import { ServerHttp2Stream, OutgoingHttpHeaders } from "http2";

interface JsonOptions {
	headers?: OutgoingHttpHeaders
}

export default function json(stream: ServerHttp2Stream, status: number, data: any, options: JsonOptions = {}) {
	let headers = {};

	if (options.headers != null) {
		headers = {
			...options.headers,
			":status": status,
			"content-type": "application/json"
		};
	}
	else {
		headers = {
			":status": status,
			"content-type": "application/json"
		};
	}
	
	stream.respond(headers);
	stream.end(JSON.stringify(data));
}