import {default as nFS, readdir} from "fs";
import {default as nPath} from "path";

import merge from "lodash/merge";

import {runCheck} from "./common";

export interface ReadOptions {
	ignore?: Array<string>,
	depth?: number,
	with_stats?: boolean,
	include_file?: boolean,
	include_dir?: boolean,
	single_list?: boolean,
	base?: string
}

const read_default: ReadOptions = {
	ignore: [],
	depth: 0,
	with_stats: false,
	include_file: true,
	include_dir: true,
	single_list: false,
	base: ''
};

function getStatType(stats: nFS.Stats): string {
	if(stats.isDirectory())
		return 'dir';
	else if(stats.isFile())
		return 'file';
	else if(stats.isSymbolicLink())
		return 'sym-link';
	else
		return 'unknown';
}

export interface ReadStats {
	base:string,
	item:string,
	name:string,
	stats:nFS.Stats,
	type:string
}

function getReadStats(path: string, opt: ReadOptions , stats: nFS.Stats): ReadStats {
	return {
		base: String(opt.base),
		item: path.replace(opt.base,''),
		name: nPath.basename(path),
		stats: stats,
		type: getStatType(stats)
	};
}

export interface ReadResultObjectTmplt<T> {
	files: Array<T>,
	directories: Array<T>
}
export type ReadResultArrayTmplt<T> = Array<T>;

export type ReadResultObject = ReadResultObjectTmplt<string|ReadStats>;
export type ReadResultArray = ReadResultArrayTmplt<string|ReadStats>;
export type ReadResult = ReadResultObject | ReadResultArray;

async function rRead(path: string, opt: ReadOptions): Promise<ReadResult> {
	let found = opt.single_list ? <ReadResultArray>[] : <ReadResultObject>{
		files: [],
		directories: []
	};
	let contents = await nFS.promises.readdir(path);

	for(let item of contents) {
		let item_path = nPath.join(path,item);
		let stats = await nFS.promises.stat(item_path);

		if(!runCheck(item_path,opt.ignore)) {
			if(stats.isDirectory()) {
				if(opt.depth !== 0) {
					--opt.depth;

					if(opt.include_dir) {
						if(opt.single_list)
							(found as ReadResultArray).push(opt.with_stats ? getReadStats(item_path,opt,stats) : item_path);
						else
							(found as ReadResultObject).directories.push(opt.with_stats ? getReadStats(item_path,opt,stats) : item_path);
					}

					let res = await rRead(item_path,opt);

					if(opt.single_list) {
						(found as ReadResultArray) = (found as ReadResultArray).concat((res as ReadResultArray));
					} else {
						if(opt.include_dir)
							(found as ReadResultObject).directories = (found as ReadResultObject)
							.directories
							.concat((res as ReadResultObject).directories);

						if(opt.include_file)
							(found as ReadResultObject).files = (found as ReadResultObject)
							.files
							.concat((res as ReadResultObject).files);
					}
				} else {
					if(opt.include_dir) {
						if(opt.single_list)
							(found as ReadResultArray).push(opt.with_stats ? getReadStats(item_path,opt,stats) : item_path);
						else
							(found as ReadResultObject).directories.push(opt.with_stats ? getReadStats(item_path,opt,stats) : item_path);
					}
				}
			} else if(stats.isFile()) {
				if(opt.include_file) {
					if(opt.single_list)
						(found as ReadResultArray).push(opt.with_stats ? getReadStats(item_path,opt,stats) : item_path);
					else
						(found as ReadResultObject).files.push(opt.with_stats ? getReadStats(item_path,opt,stats) : item_path);
				}
			}
		}
	}

	return found;
}

function rReadSync(path: string,opt: ReadOptions): ReadResult {
	let found = opt.single_list ? [] : {
		files: [],
		directories: []
	};
	let contents = nFS.readdirSync(path);

	for(let item of contents) {
		let item_path = nPath.join(path,item);
		let stats = nFS.lstatSync(item_path);

		if(!runCheck(item_path,opt.ignore)) {
			if(stats.isDirectory()) {
				if(opt.depth !== 0) {
					--opt.depth;

					if(opt.include_dir) {
						if(opt.single_list)
							(found as ReadResultArray).push(opt.with_stats ? getReadStats(item_path,opt,stats) : item_path);
						else
							(found as ReadResultObject).directories.push(opt.with_stats ? getReadStats(item_path,opt,stats) : item_path);
					}

					let res = rReadSync(item_path,opt);

					if(opt.single_list) {
						(found as ReadResultArray) = (found as ReadResultArray).concat((res as ReadResultArray));
					} else {
						if(opt.include_dir)
							(found as ReadResultObject).directories = (found as ReadResultObject)
							.directories
							.concat((res as ReadResultObject).directories);

						if(opt.include_file)
							(found as ReadResultObject).files = (found as ReadResultObject)
							.files
							.concat((res as ReadResultObject).files);
					}
				} else {
					if(opt.include_dir) {
						if(opt.single_list)
							(found as ReadResultArray).push(opt.with_stats ? getReadStats(item_path,opt,stats) : item_path);
						else
							(found as ReadResultObject).directories.push(opt.with_stats ? getReadStats(item_path,opt,stats) : item_path);
					}
				}
			} else if(stats.isFile()) {
				if(opt.include_file) {
					if(opt.single_list)
						(found as ReadResultArray).push(opt.with_stats ? getReadStats(item_path,opt,stats) : item_path);
					else
						(found as ReadResultObject).files.push(opt.with_stats ? getReadStats(item_path,opt,stats) : item_path);
				}
			}
		}
	}

	return found;
}

export async function readDir(path: string, opt: ReadOptions = {}) {
	opt = merge({},read_default,opt);

	return await rRead(path,opt);
}

export function readDirSync(path: string, opt: ReadOptions = {}) {
	opt = merge({},read_default,opt);

	return rReadSync(path, opt);
}