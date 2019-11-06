import log from 'modules/log';
import setup, { loadEtc, processCliArgs, checkDirectories } from "modules/setup/index";
process.on('exit', code => {
    log.warn('process exiting', { code });
});
process.on('uncaughtException', err => {
    log.error(err.stack);
    process.exit();
});
async function main() {
    log.info("initializing setup");
    log.info("loading etc");
    await loadEtc(setup);
    log.info("processing cli");
    await processCliArgs(setup);
    log.info("checking directories");
    await checkDirectories(setup);
    const server = require('./main');
    const loadRoutes = require('./load_routes');
    log.info('loading routes');
    loadRoutes();
    log.info('creating server');
    server.create();
    log.info('opening server for connections');
    await server.listen(443, '0.0.0.0');
    log.info('server listening', server.instance.address());
    if (process.env.NODE_ENV === 'development') {
        require('./dev');
        log.info('loading test data for database');
        let runTestData = require('../psql/test_data');
        await runTestData();
    }
}
log.setName('server');
main().catch(err => {
    log.error(`uncaught error in main\n${err.stack}`);
});
//# sourceMappingURL=index.js.map