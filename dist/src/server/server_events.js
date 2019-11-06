import server from "./server";
import log from "modules/log";
server.on('error', err => {
    log.error(err.stack);
});
server.on('close', async () => {
    log.info('server closed', {
        connections: server.totalSessions()
    });
});
server.on('session', session => {
    session.on('close', () => {
        log.debug('session close');
    });
    session.on('error', err => {
        log.error(`session error:`, err.stack);
    });
    session.on('timeout', () => {
        log.debug('session timeout');
    });
    session.on('connect', () => {
        log.debug('session connect');
    });
    log.debug('session connection');
});
//# sourceMappingURL=server_events.js.map