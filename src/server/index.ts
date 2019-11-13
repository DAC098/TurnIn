import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

import importer from "app/lib/importer";

import logger from './logger';
import {default as route_load_order} from "./routes/order";

const __dirname = dirname(fileURLToPath(import.meta.url));

process.on('exit',(code) => {
	if (code !== 0) {
		logger.warn('process exiting. code:',code);
	}
});

async function main() {
	logger.info("loading setup");

	const setup = (await import("./setup")).default;

	logger.info("loading server");
	
	const server = (await import("./server")).default;

	logger.info("loading database");

	await import("./db");

	logger.info("loading routes");

	await importer(join(__dirname,"routes"), route_load_order);

	logger.info('opening server for connections');

	let listen_port = setup.getKey("server.port");
	let listen_host = setup.getKey("server.hostname");
	let listen_backlog = setup.getKey("server.backlog");

	if (typeof listen_port !== "number") {
		listen_port = 0;
	}

	if (typeof listen_host !== "string" || listen_host.length === 0) {
		listen_host = null;
	}

	if (typeof listen_backlog !== "number") {
		listen_backlog = null;
	}
	
	await server.listen(listen_port, listen_host, listen_backlog);

	logger.info('server listening',server.address());
}

main().catch(err => {
	logger.error(err.stack);
});
