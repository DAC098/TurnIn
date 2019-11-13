import { join, sep } from "path";
import { promises as fs } from "fs";
import { exists } from "./fs/common";

export async function importItem(import_item: string) {
	let stat = await fs.stat(import_item);

	if (stat.isDirectory()) {
		import_item += sep + "index.js";

		if (!await exists(import_item,"file")) {
			return;
		}
	}
	else if (!stat.isFile()) {
		return;
	}

	if (process.platform === "win32") {
		// as of right now import() does not like windows style paths
		import_item = "/" + import_item.replace(/\\/g,"/");
	}

	await import(import_item);
}

async function importer(import_dir: string, load_order: string[]) {
	let import_dir_contents = await fs.readdir(import_dir);

	if (load_order != null) {
		for (let item of load_order) {
			if (import_dir_contents.includes(item)) {
				await importItem(join(import_dir,item));
			}	
		}
	}
	else {
		for (let item of import_dir_contents) {
			await importItem(join(import_dir, item));
		}
	}
}

export default importer;