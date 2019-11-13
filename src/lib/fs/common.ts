import minimatch from "minimatch";
import {default as nFS} from "fs";
import {default as nPath} from "path";
import {default as jsYaml} from "js-yaml";
import asyncPump from "../streaming/asyncPump";
import { readDir, ReadResultObjectTmplt, readDirSync } from "./readDir";

import reverse from "lodash/reverse";

export function runCheck(inspect: string, check: Array<string|RegExp>|string|RegExp): boolean {
	if(Array.isArray(check)) {
		for(let item of check) {
			if(item instanceof RegExp) {
				if(item.test(inspect))
					return true;
			} else if(typeof item === 'string') {
				if(inspect.includes(item) || minimatch(inspect,item))
					return true;
			}
		}

		return false;
	} else {
		if(check instanceof RegExp) {
			return check.test(inspect);
		} else {
			return typeof check === 'string' ? inspect.includes(check) || minimatch(inspect,check) : false;
		}
	}
}

export async function stats(path: nFS.PathLike) {
	try {
		return await nFS.promises.stat(path);
	}
	catch (err) {
		if (err.code === "ENOENT") {
			return null;
		}

		throw err;
	}
}

export function statsSync(path: nFS.PathLike) {
	try {
		return nFS.statSync(path);
	}
	catch (err) {
		if (err.code === "ENOENT") {
			return null;
		}

		throw err;
	}
}

type FileType = "file" | "dir" | "sym_link" | "fifo" | "char_device" | "socket";

function checkStatType(stat: nFS.Stats, type: FileType) {
	switch(type) {
		case "file":
			return stat.isFile();
		case "dir":
			return stat.isDirectory();
		case "sym_link":
			return stat.isSymbolicLink();
		case "fifo":
			return stat.isFIFO();
		case "char_device":
			return stat.isCharacterDevice();
		case "socket":
			return stat.isSocket();
		default:
			return true;
	}
}

export async function exists(path: nFS.PathLike, type?: FileType) {
	let stat = await stats(path);

	if (stat == null)
		return false;

	return checkStatType(stat,type);
}

export function existsSync(path: nFS.PathLike, type?: FileType) {
	let stat = statsSync(path);

	if (stat == null)
		return false;

	return checkStatType(stat,type);
}

export async function loadYaml<T = {}>(path: nFS.PathLike): Promise<T> {
	let data = await nFS.promises.readFile(path);
	return jsYaml.safeLoad(data);
}

export function loadYamlSync<T = {}>(path: nFS.PathLike): T {
	let data = nFS.readFileSync(path);
	return jsYaml.safeLoad(data);
}

export async function copy(current_path: nFS.PathLike, new_path: nFS.PathLike) {
	let read_stream = nFS.createReadStream(current_path);
	let write_stream = nFS.createWriteStream(new_path);

	await asyncPump(read_stream,write_stream);
}

export async function makeDir(path: string | string[], mode?: string | number | nFS.MakeDirectoryOptions) {
	if (Array.isArray(path)) {
		path = nPath.join(...path);
	}

	let parse = nPath.parse(path);
	let check = parse.root;
	let parts = nPath.join(parse.dir.replace(parse.root,""), parse.base).split(nPath.sep);

	for (let part of parts) {
		check = nPath.join(check, part);

		let stat = await stats(check);

		if (stat == null || !stat.isDirectory()) {
			await nFS.promises.mkdir(check,mode);
		}
	}
}

export function makeDirSync(path: string | string[], mode?: string | number | nFS.MakeDirectoryOptions) {
	if (Array.isArray(path)) {
		path = nPath.join(...path);
	}

	let parse = nPath.parse(path);
	let check = parse.root;
	let parts = nPath.join(parse.dir.replace(parse.root,""), parse.base).split(nPath.sep);

	for (let part of parts) {
		check = nPath.join(check, part);

		let stat = statsSync(check);

		if (stat == null || !stat.isDirectory()) {
			nFS.mkdirSync(check,mode);
		}
	}
}

export async function removeDir(path: string, rm_files: boolean = false) {
	let contents = (await readDir(path,{depth: -1}) as ReadResultObjectTmplt<string>);

	if (contents.files.length !== 0 && !rm_files) {
		throw new Error("directory not empty");
	}
	else {
		for (let file of contents.files) {
			await nFS.promises.unlink(file);
		}

		for (let dir of reverse(contents.directories)) {
			await nFS.promises.rmdir(dir);
		}

		await nFS.promises.rmdir(path);
	}
}

export function removeDirSync(path: string, rm_files: boolean = false) {
	let contents = (readDirSync(path,{depth:-1}) as ReadResultObjectTmplt<string>);

	if (contents.files.length !== 0 && !rm_files) {
		throw new Error("directory not empty");
	}
	else {
		for (let file of contents.files) {
			nFS.unlinkSync(file);
		}

		for (let dir of reverse(contents.directories)) {
			nFS.rmdirSync(dir);
		}

		nFS.rmdirSync(path);
	}
}