import File from "../lib/fs/File";
import HTTP2Server from "../lib/servers/HTTP2Server";

import setup from "./setup";
import logger from "./logger";
import router from "./router";

import { URL } from "url";
import { constants } from "http2";

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

	if (!File.existsSync(key_file)) {
		throw new Error(`tls.key not found. file: "${key_file}"`);
	}
	else {
		opts["key"] = File.readSync(key_file);
	}

	if (!File.existsSync(cert_file)) {
		throw new Error(`tls.cert not found. file: "${cert_file}"`);
	}
	else {
		opts["cert"] = File.readSync(cert_file);
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

		try {
			let result = await router.run(url,method.toLowerCase(),[stream,headers,flags,{url}]);

			if (!result.found_path) {
				if (stream.headersSent) {
					logger.warn("path not found but headers were sent");
				}
				else {
					logger.debug("path not found");

					stream.respond({
						":status": 404,
						"content-type": "text/plain"
					});
					stream.end("resource not found");
				}
			}
			else {
				if (!result.valid_method) {
					if (stream.headersSent) {
						logger.warn("method not found but headers were sent");
					}
					else {
						logger.debug("method not found");

						stream.respond({
							":status": 405,
							"content-type": "text/plain"
						});
						stream.end("unhandled method");
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
				stream.respond({
					":status": 500,
					"content-type": "text/plain"
				});
				stream.end("server error when processing request");
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