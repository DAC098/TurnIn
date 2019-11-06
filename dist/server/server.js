import setup from "../modules/setup";
import File from "../lib/fs/File";
import HTTP2Server from "../lib/servers/HTTP2Server";
import logger from "./logger";
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
const server = new HTTP2Server(opts, { secure: secure_server });
server.on("session", session => {
    session.on("stream", (stream, headers, flags) => {
        stream.respond({
            "status": 200,
            "content-type": "text/plain"
        });
        stream.write("okay");
        stream.end("good request");
        const status = stream.sentHeaders[":status"];
        const method = headers[":method"];
        const path = headers[":path"];
        logger.info(`${method} ${status} ${path}`);
    });
});
server.on('error', err => {
    logger.error(err.stack);
});
server.on('close', async () => {
    logger.info('server closed', {
        connections: server.totalSessions()
    });
});
server.on('session', session => {
    session.on('close', () => {
        logger.debug('session close');
    });
    session.on('error', err => {
        logger.error(`session error:`, err.stack);
    });
    session.on('timeout', () => {
        logger.debug('session timeout');
    });
    session.on('connect', () => {
        logger.debug('session connect');
    });
    logger.debug('session connection');
});
export default server;
//# sourceMappingURL=server.js.map