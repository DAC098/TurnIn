import logger from './logger';
import setup, { loadEtc, processCliArgs } from "../modules/setup";
process.on('exit', code => {
    logger.warn('process exiting. code:', code);
});
process.on('uncaughtException', err => {
    logger.error(err.stack);
    process.exit();
});
async function main() {
    logger.info("initializing setup");
    logger.info("loading etc");
    await loadEtc(setup);
    logger.info("processing cli");
    await processCliArgs(setup);
    logger.debug("setup", setup.get());
    // log.info("checking directories");
    // await checkDirectories(setup);
    const server = (await import("./server")).default;
    // const loadRoutes = require('./load_routes');
    // log.info('loading routes');
    // loadRoutes();
    // log.info('creating server');
    // server.create();
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
    logger.info('server listening', server.address());
}
main().catch(err => {
    logger.error(`${err.message}`);
});
//# sourceMappingURL=index.js.map