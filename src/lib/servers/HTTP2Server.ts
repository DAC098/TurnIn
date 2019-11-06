import * as HTTP2 from "http2";
import { EventEmitter } from "events";

export interface Options {
	secure?: boolean
}

export type ServerOptions = HTTP2.SecureServerOptions | HTTP2.ServerOptions;
type ServerInstance = HTTP2.Http2Server;

declare interface HTTP2Server extends EventEmitter {
	on(event: "session", cb: (session: HTTP2.ServerHttp2Session) => void): this,
	once(envet: "session", cb: (session: HTTP2.ServerHttp2Session) => void): this,

	on(event: "sessionError", cb: (error: Error) => void): this,
	once(event: "sessionError", cb: (error: Error) => void): this,

	on(event: "stream", cb: (stream: HTTP2.ServerHttp2Stream, headers: HTTP2.IncomingHttpHeaders, flags: number) => void): this,
	once(event: "stream", cb: (stream: HTTP2.ServerHttp2Stream, headers: HTTP2.IncomingHttpHeaders, flags: number) => void): this,

	on(event: "timeout", cb: () => void): this,
	once(event: "timeout", cb: () => void): this,

	on(event: "close", cb: () => void): this,
	once(event: "close", cb: () => void): this,

	on(event: "checkContinue", cb: (req: HTTP2.Http2ServerRequest, res: HTTP2.Http2ServerResponse) => void): this,
	once(event: "checkContinue", cb: (req: HTTP2.Http2ServerRequest, res: HTTP2.Http2ServerResponse) => void): this,

	on(event: "request", cb: (req: HTTP2.Http2ServerRequest, res: HTTP2.Http2ServerResponse) => void): this,
	once(event: "request", cb: (req: HTTP2.Http2ServerRequest, res: HTTP2.Http2ServerResponse) => void): this,

	on(event: "error", cb: (error: Error) => void): this,
	once(event: "error", cb: (error: Error) => void): this,

	on(event: "listening", cb: () => void): this,
	once(event: "listening", cb: () => void): this,

	on(event: "unknownProtocol", cb: () => void): this,
	once(event: "unknownProtocol", cb: () => void): this,
}

class HTTP2Server extends EventEmitter {
	
	private server_options: ServerOptions;

	private active_sessions: HTTP2.ServerHttp2Session[] = [];
	private active_sessions_count: number = 0;

	private instance: ServerInstance;
	
	private open: boolean = false;

	constructor(server_options: ServerOptions, options: Options) {
		super();

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

		this.instance.on("checkContinue", (req,res) => this.emit("checkContinue",req,res));
		this.instance.on("sessionError", err => this.emit("sessionError", err));
		this.instance.on("stream", (stream,headers,flags) => this.emit("stream",stream,headers,flags));
		this.instance.on("timeout",() => this.emit("timeout"));

		this.instance.on("listening", () => {
			this.open = true;
		});

		this.instance.on("close", () => {
			this.open = false;
			this.emit("close");
		});

		this.instance.on("request", (req,res) => this.emit("request",req,res));
	}

	public * getSessions() {
		for (let session of this.active_sessions) {
			if (session != null) {
				yield session;
			}
		}
	}

	public totalSessions() {
		return this.active_sessions_count;
	}

	public countConnections() {
		return this.active_sessions_count;
	}

	public closeSessions() {
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

	public close() {
		return new Promise((resolve,reject) => {
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

	public async shutdown() {
		await this.closeSessions();
		await this.close();
	}

	public listen(port?: number, host?: string, backlog?: number) {
		return new Promise(resolve => {
			this.instance.listen(port, host, backlog, () => {
				resolve();
			});
		});
	}

	public address() {
		return this.instance.address();
	}
}

export default HTTP2Server;