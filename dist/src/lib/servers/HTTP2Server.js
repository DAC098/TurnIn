import * as HTTP2 from "http2";
import { EventEmitter } from "events";
class HTTP2Server extends EventEmitter {
    constructor(server_options, options) {
        super();
        this.open = false;
        this.server_options = server_options;
        this.instance = options.secure ?
            HTTP2.createSecureServer(this.server_options) :
            HTTP2.createServer(this.server_options);
        this.instance.on("session", session => {
            let ses_index = 0;
            let set_session = false;
            for (; ses_index < this.active_sessions.length; ++ses_index) {
                if (this.active_sessions[ses_index] == null) {
                    this.active_sessions[ses_index] = session;
                    set_session = true;
                    break;
                }
            }
            if (!set_session) {
                this.active_sessions.push(session);
            }
            ++this.active_sessions_count;
            session.on("close", () => {
                --this.active_sessions_count;
                this.active_sessions[ses_index] = null;
            });
            this.emit("session", session);
        });
        this.instance.on("checkContinue", (req, res) => this.emit("checkContinue", req, res));
        this.instance.on("sessionError", err => this.emit("sessionError", err));
        this.instance.on("stream", (stream, headers, flags) => this.emit("stream", stream, headers, flags));
        this.instance.on("timeout", () => this.emit("timeout"));
        this.instance.on("listening", () => {
            this.open = true;
        });
        this.instance.on("close", () => {
            this.open = false;
            this.emit("close");
        });
        this.instance.on("request", (req, res) => this.emit("request", req, res));
    }
    *getSessions() {
        for (let session of this.active_sessions) {
            if (session != null) {
                yield session;
            }
        }
    }
    totalSessions() {
        return this.active_sessions_count;
    }
    countConnections() {
        return this.active_sessions_count;
    }
    closeSessions() {
        return new Promise(resolve => {
            let count = 0;
            for (let session of this.getSessions()) {
                ++count;
                session.on("close", () => {
                    if (count == 0) {
                        resolve();
                    }
                });
                session.close();
            }
        });
    }
    close() {
        return new Promise((resolve, reject) => {
            this.instance.close(err => {
                if (err) {
                    reject(err);
                }
                else {
                    resolve();
                }
            });
        });
    }
    async shutdown() {
        await this.closeSessions();
        await this.close();
    }
    listen(port, host, backlog) {
        return new Promise(resolve => {
            this.instance.listen(port, host, backlog, () => {
                resolve();
            });
        });
    }
}
export default HTTP2Server;
//# sourceMappingURL=HTTP2Server.js.map