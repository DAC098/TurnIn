import { ServerHttp2Stream, IncomingHttpHeaders } from "http2";
import sendJSON from "app/lib/servers/response/json";

export function notFound(stream: ServerHttp2Stream,headers: IncomingHttpHeaders,flags: number) {
	let accepting = headers["accept"];

	if (accepting == null) {
		stream.respond({
			":status": 404,
			"content-type": "text/plain"
		});

		stream.end("resource not found");

		return;
	}

	if (accepting.includes("application/json")) {
		sendJSON(stream,404,{message: "resource not found"});
	}
	else if (accepting.includes("text/html")) {
		stream.respond({
			":status": 404,
			"content-type": "text/html"
		});

		stream.end(`
		<!DOCTYPE html>
		<html>
			<head>
				<title>Not Found</title>
			</head>
			<body>
				<h4>Not Found</h4>
				<span>the requested resource was not found</span>
			</body>
		</html>
		`);
	}
	else {
		stream.respond({
			":status": 404,
			"content-type": "text/plain"
		});

		stream.end("resource not found");
	}
}

export function invalidMethod(stream: ServerHttp2Stream, headers: IncomingHttpHeaders, flags: number) {
	let accpeting = headers["accept"];

	if (accpeting == null) {
		stream.respond({
			":status": 405,
			"content-type": "text/plain"
		});

		stream.end("invalid method");

		return;
	}

	if (accpeting.includes("application/json")) {
		sendJSON(stream,405,{message:"invalid method"});
	}
	else if (accpeting.includes("text/html")) {
		stream.respond({
			":status": 405,
			"content-type": "text/html"
		});

		stream.end(`
		<!DOCTYPE html>
		<html>
			<head>
				<title>Invalid Method</title>
			</head>
			<body>
				<h4>Invalid Method</h4>
				<span>the requested resource was unable to handle this request method</span>
			</body>
		</html>
		`);
	}
	else {
		stream.respond({
			":status": 405,
			"content-type": "text/plain"
		});

		stream.end("invalid method");
	}
}

export function serverError(stream: ServerHttp2Stream,headers: IncomingHttpHeaders,flags: number,error: Error) {
	let accepting = headers["accept"];

	if (accepting == null) {
		stream.respond({
			":status": 500,
			"content-type": "text/plain"
		});

		stream.end(`server error\n${error.stack}`);

		return;
	}

	if (accepting.includes("application/json")) {
		sendJSON(stream,500,{message:"server error",error: error.stack});
	}
	else if (accepting.includes("text/html")) {
		stream.respond({
			":status": 500,
			"content-type": "text/html"
		});

		stream.end(`
		<!DOCTYPE html>
		<html>
			<head>
				<title>Server Error</title>
			</head>
			<body>
				<h4>Server Error</h4>
				<span>there was an unexpected error when handling your request</span>
				<pre>${error.stack}</pre>
			</body>
		</html>
		`);
	}
	else {
		stream.respond({
			":status": 500,
			"content-type": "text/plain"
		});

		stream.end(`server error\n${error.stack}`);
	}
}