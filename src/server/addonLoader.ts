import { fileURLToPath } from "url";
import { dirname, join } from "path";
import { promises as fs } from "fs";
import logger from "./logger";
import order from "./addon/order";
import File from "../lib/fs/File";

const __dirname = dirname(fileURLToPath(import.meta.url));
const addon_dir = join(__dirname,"addon");

async function addonLoader() {
	let addon_dir_contents = await fs.readdir(addon_dir);

	for (let item of order) {
		if (addon_dir_contents.includes(item)) {
			logger.info("loading addon:",item);

			try {
				let addon_index_file = join(addon_dir,item,"index.js");

				if (!await File.exists(addon_index_file)) {
					logger.warn("addon index file not found. file:",addon_index_file);
					continue;
				}

				if (process.platform === "win32") {
					// as of right now import() does not like windows style paths
					addon_index_file = "/" + addon_index_file.replace(/\\/g,"/");
				}
				
				await import(addon_index_file);
			} catch(err) {
				logger.warn("error when loading addon",item,err.message);
			}
		}
	}
}

export default addonLoader;