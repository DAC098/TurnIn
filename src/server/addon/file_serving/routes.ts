import path from "path";
import fs from "fs";
import { constants } from "http2";

import mime from "mime";

import asyncPump from "../../../lib/streaming/asyncPump";
import {default as FSFile} from "../../../lib/fs/File";
import json from "../../../lib/servers/response/json";

import logger from "../../logger";
import router from "../../router";

const cwd = process.cwd();

router.addRoute({
	path: "/assets/:path*",
	methods: "get"
}, async ([stream,headers,flags,data], route_data) => {
	let current_url = route_data.getURL();
	let file_path = path.join(cwd,current_url.pathname);

	if (await FSFile.exists(file_path)) {
		stream.respond({
			":status": 200,
			"content-type": mime.getType(path.extname(file_path))
		});

		try {
			let file_stream = fs.createReadStream(file_path);

			await asyncPump(file_stream,stream);

			stream.end();
		} catch(err) {
			logger.error(err.message);

			stream.close(constants.NGHTTP2_STREAM_CLOSED);
		}
	}
	else {
		json(stream, 404, {message: "file_not_found"});
	}
});