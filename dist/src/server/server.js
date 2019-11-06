import setup from "modules/setup";
import File from "lib/fs/File";
import handle from "./handle";
import HTTP2Server from "lib/servers/HTTP2Server";
const opts = {
    key: File.readSync(setup.getKey("tls.key")),
    cert: File.readSync(setup.getKey("tls.cert")),
    allowHTTP1: true
};
const server = new HTTP2Server(opts, { secure: true });
server.on("request", (req, res) => handle(req, res));
export default server;
//# sourceMappingURL=server.js.map