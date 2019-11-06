import {default as nFS} from "fs"
import {default as nPath} from "path"
import {default as nUtil} from "util"
import {default as jsYaml} from "js-yaml"
import {default as pump} from "pump"

const nLStat = nUtil.promisify(nFS.lstat);

const nReadFile = nUtil.promisify(nFS.readFile);
const nWriteFile = nUtil.promisify(nFS.writeFile);
const nUnlinkFile = nUtil.promisify(nFS.unlink);

export default class File {
	constructor() {}
	
	static async stats(path: nFS.PathLike): Promise<nFS.Stats> {
		return await nLStat(path);
	}
	
	static statsSync(path: nFS.PathLike): nFS.Stats {
		return nFS.lstatSync(path);
	}
	
	static async exists(path: nFS.PathLike): Promise<boolean> {
		try {
			let stats = await File.stats(path);

			return stats.isFile();
		} catch(err) {
			return false;
		}
	}
	
	static existsSync(path: nFS.PathLike): boolean {
		try {
			let stats = File.statsSync(path);

			return stats.isFile();
		} catch(err) {
			return false;
		}
	}
	
	static async read(path: nFS.PathLike, options?: {encoding?: null, flat?: string}) {
			if(await File.exists(path))
				return nReadFile(path,options);
			else
				return '';
	}

	static readSync(path: nFS.PathLike, options?: {encoding?: null, flat?: string}) {
		if(File.existsSync(path))
			return nFS.readFileSync(path,options);
		else
			return '';
	}
	
	static async write(path: string | number | Buffer | URL, data: any, options?: nFS.WriteFileOptions) {
		let write = typeof data.then === 'function' ? await data : data;
		await nWriteFile(path,write,options);
	}
	
	static writeSync(path: string | number | Buffer | URL, data: any, options?: nFS.WriteFileOptions) {
		nFS.writeFileSync(path,data,options);
	}
	
	static async remove(path: nFS.PathLike) {
		if(await File.exists(path))
			await nUnlinkFile(path);

		return true;
	}
	
	static removeSync(path: nFS.PathLike) {
		if(File.existsSync(path))
			nFS.unlinkSync(path);

		return true;
	}
	
	static async loadYaml<ReturnObject = {}>(path: nFS.PathLike): Promise<ReturnObject> {
		let data = await File.read(path);
		return jsYaml.safeLoad(data);
	}
	
	static loadYamlSync<ReturnObject = {}>(path: nFS.PathLike): ReturnObject {
		let data = File.readSync(path);
		return jsYaml.safeLoad(data);
	}
	
	static copy(current_path: nFS.PathLike, new_path: nFS.PathLike): Promise<void> {
		return new Promise((resolve,reject) => {
			let read_stream = nFS.createReadStream(current_path);
			let write_stream = nFS.createWriteStream(new_path);

			pump(read_stream, write_stream, err => {
				if(err)
					reject(err);
				else
					resolve();
			});
		});
	}
}