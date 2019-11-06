import Instance from "./Instance";

import {default as jsonParser} from "../parsing/http/json";
import { createReadStream } from "fs";
import asyncPump from "../streaming/asyncPump";

interface ListFilter {}

interface BuildOptions {
	dockerfile?: string,
	labels?: {[key: string]: string},
	tags?: string | string[],
	remote?: string,
	rm?: boolean,
	no_cache?: boolean
}

declare interface Image {}

class Image {

	public static async list(instance: Instance, all?: boolean, filters?: ListFilter) {
		let query = [];

		if (all != null) {
			query.push(`all=${all ? "true" : "false"}`);
		}

		if (filters != null) {
			query.push(`filters=${JSON.stringify(filters)}`);
		}

		let response = await instance.request(
			{
				method: "GET",
				path: `/images/json${query.length > 0 ? `?${query.join("&")}` : ""}`
			}
		);

		return {
			success: response.statusCode === 200,
			returned: await jsonParser(response)
		};
	}
	
	public static build(instance: Instance, dockerfile_path, options?: BuildOptions) {
		return new Promise(async (resolve,reject) => {
			let query = [];
			let dockerfile_istream = createReadStream(dockerfile_path);

			if (options.dockerfile != null) {
				query.push(`dockerfile=${options.dockerfile}`);
			}

			if (options.labels != null) {
				query.push(`labels=${JSON.stringify(options.labels)}`);
			}

			if (options.tags != null) {
				if (Array.isArray(options.tags)) {
					for (let t of options.tags) {
						query.push(`t=${t}`);
					}
				}
				else {
					query.push(`t=${options.tags}`);
				}
			}

			if (options.rm != null) {
				query.push(`rm=${options.rm ? "true" : "false"}`);
			}

			if (options.no_cache != null) {
				query.push(`nocache=${options.no_cache ? "true" : "false"}`);
			}

			let request = instance.createRequest({
				method: "POST",
				path: `/build${query.length > 0 ? `?${query.join("&")}` : ""}`,
				headers: {
					"Content-Type": "application/x-tar"
				}
			});

			request.on("response",async res => {
				if (res.statusCode === 200) {
					resolve({
						success: true,
						returned: res
					});
				}
				else {
					let body = null;

					if ("content-type" in res.headers && res.headers["content-type"].includes("application/json")) {
						body = await jsonParser(res);
					}

					resolve({
						success: false,
						returned: body
					});
				}
			});

			request.on("error", err => {
				reject(err);
			});

			await asyncPump(dockerfile_istream, request);
		});
	}
}

export default Image;