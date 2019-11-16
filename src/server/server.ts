import {default as nFS} from "fs";
import { URL } from "url";
import { constants } from "http2";
import { performance } from "perf_hooks";

import HTTP2Server from "app/lib/servers/HTTP2Server";
import { existsSync } from "app/lib/fs/common";

import setup from "./setup";
import logger from "./logger";
import router from "./router";
import * as handles from "./handles";

function wait(msec: number) {
	return new Promise(resolve => {
		setTimeout(() => {
			resolve();
		},msec);
	});
}

let secure_server = setup.getKey("server.secure");
let opts = {};

if (secure_server) {
	let key_file = setup.getKey("tls.key");
	let cert_file = setup.getKey("tls.cert");

	if (!existsSync(key_file,"file")) {
		throw new Error(`tls.key not found. file: "${key_file}"`);
	}
	else {
		opts["key"] = nFS.readFileSync(key_file);
	}

	if (!existsSync(cert_file,"file")) {
		throw new Error(`tls.cert not found. file: "${cert_file}"`);
	}
	else {
		opts["cert"] = nFS.readFileSync(cert_file);
	}
}

const server = new HTTP2Server(opts,{secure:secure_server});

server.on("session", session => {
	let active_streams = 0;

	session.on("stream", async (stream, headers, flags) => {
		const path = headers[":path"];
		const scheme = headers[":scheme"];
		const method = headers[":method"];
		const authority = headers[":authority"];

		let url = new URL(path,`${scheme}://${authority}`);

		if (server.isClosing()) {
			stream.close(constants.NGHTTP2_REFUSED_STREAM);
			return;
		}

		++active_streams;

		stream.on("close", () => {
			--active_streams;

			if (server.isClosing() && active_streams === 0) {
				session.close();
			}
		});

		logger.debug(`incoming stream: ${method} ${path}`);

		try {
			let request_start = performance.now();
			let result = await router.run(url,method.toLowerCase(),[stream,headers,flags,{url}]);

			logger.perf("request time:",performance.now() - request_start,"ms");

			if (!result.found_path) {
				if (stream.headersSent) {
					logger.warn("path not found but headers were sent");
				}
				else {
					handles.notFound(stream,headers,flags);
				}
			}
			else {
				if (!result.valid_method) {
					if (stream.headersSent) {
						logger.warn("method not found but headers were sent");
					}
					else {
						handles.invalidMethod(stream,headers,flags);
					}
				}
			}
		}
		catch (err) {
			logger.error("request error", err);

			if (stream.headersSent) {
				stream.close(constants.NGHTTP2_INTERNAL_ERROR);
			}
			else {
				handles.serverError(stream,headers,flags,err);
			}
		}

		const status = stream.sentHeaders[":status"];
		
		logger.info(`${method} ${status} ${path}`);
	});

	session.on('close', () => {
		logger.debug('session close');
	});

	session.on('error', err => {
		logger.error(`session error:`,err.stack);
	});

	session.on('timeout', () => {
		logger.debug('session timeout');
	});

	session.on('connect', () => {
		logger.debug('session connect');
	});

	logger.debug('session connection');
});

server.on('error', err => {
	logger.error(err.stack);
});

server.on('close', async () => {
	logger.info('server closed',{
		connections: server.totalSessions()
	});
});

export default server;