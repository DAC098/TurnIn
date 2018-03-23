const nFS = require('fs');
const nPath = require('path');
const nUtil = require('util');

const merge = require('lodash/merge');
const reverse = require('lodash/reverse');

const nLStat = nUtil.promisify(nFS.lstat);

const nReadDir = nUtil.promisify(nFS.readdir);
const nMkDir = nUtil.promisify(nFS.mkdir);
const nRmDir = nUtil.promisify(nFS.rmdir);

const common = require('./common');
const File = require('./File');

/**
 *
 * @typedef {{
 *  ignore: Array<string>,
  * depth: number,
  * with_stats: boolean,
  * include_file: boolean,
  * include_dir: boolean,
  * single_list: boolean,
  * base: string
  * }}
 */
const read_default = {
	ignore: [],
	depth: 0,
	with_stats: false,
	include_file: true,
	include_dir: true,
	single_list: false,
	base: ''
};

/**
 *
 * @param stats {fs.Stats}
 * @returns {string}
 */
function getStatType(stats) {
	if(stats.isDirectory())
		return 'dir';
	else if(stats.isFile())
		return 'file';
	else if(stats.isSymbolicLink())
		return 'sym-link';
	else
		return 'unknown';
}

/**
 *
 * @param path  {string}
 * @param opt   {read_default}
 * @param stats {fs.Stats}
 * @returns {{
 *   base: string,
 *   item: string,
 *   name: string,
 *   stats: fs.Stats,
 *   type: string
 * }}
 */
function getReadStats(path,opt,stats) {
	return {
		base: String(opt.base),
		item: path.replace(opt.base,''),
		name: nPath.basename(path),
		stats: stats,
		type: getStatType(stats)
	};
}

/**
 *
 * @param path
 * @param opt {read_default}
 * @returns {Promise<found>}
 */
async function rRead(path,opt) {
	/**
	 * @typedef {Array<string|getReadStats>|{
	 *   files: Array<string|getReadStats>,
	 *   directories: Array<string|getReadStats>
	 * }}
	 */
	let found = opt.single_list ? [] : {
		files: [],
		directories: []
	};
	let contents = await nReadDir(path);

	for(let item of contents) {
		let item_path = nPath.join(path,item);
		let stats = await nLStat(item_path);

		if(!common.runcheck(item_path,opt.ignore)) {
			if(stats.isDirectory()) {
				if(opt.depth !== 0) {
					--opt.depth;
					if(opt.include_dir) {
						if(opt.single_list)
							found.push(opt.with_stats ? getReadStats(item_path,opt,stats) : item_path);
						else
							found.directories.push(opt.with_stats ? getReadStats(item_path,opt,stats) : item_path);
					}

					let res = await rRead(item_path,opt);

					if(opt.single_list) {
						found = found.concat(res);
					} else {
						if(opt.include_dir)
							found.directories = found.directories.concat(res.directories);

						if(opt.include_file)
							found.files = found.files.concat(res.files);
					}
				} else {
					if(opt.include_dir) {
						if(opt.single_list)
							found.push(opt.with_stats ? getReadStats(item_path,opt,stats) : item_path);
						else
							found.directories.push(opt.with_stats ? getReadStats(item_path,opt,stats) : item_path);
					}
				}
			} else if(stats.isFile()) {
				if(opt.include_file) {
					if(opt.single_list)
						found.push(opt.with_stats ? getReadStats(item_path,opt,stats) : item_path);
					else
						found.files.push(opt.with_stats ? getReadStats(item_path,opt,stats) : item_path);
				}
			}
		}
	}

	return found;
}

/**
 *
 * @param path {string}
 * @param opt  {read_default}
 * @returns {found}
 */
function rReadSync(path,opt) {
	/**
	 * @typedef {Array<string|getReadStats>|{
	 *   files: Array<string|getReadStats>,
	 *   directories:Array<string|getReadStats
	 * }}
	 */
	let found = opt.single_list ? [] : {
		files: [],
		directories: []
	};
	let contents = nFS.readdirSync(path);

	for(let item of contents) {
		let item_path = nPath.join(path,item);
		let stats = nFS.lstatSync(item_path);

		if(!common.runcheck(item_path,opt.ignore)) {
			if(stats.isDirectory()) {
				if(opt.depth !== 0) {
					--opt.depth;

					if(opt.include_dir) {
						if(opt.single_list)
							found.push(opt.with_stats ? getReadStats(item_path,opt,stats) : item_path);
						else
							found.directories.push(opt.with_stats ? getReadStats(item_path,opt,stats) : item_path);
					}

					let res = rReadSync(item_path,opt);

					if(opt.single_list) {
						found = found.concat(res);
					} else {
						if(opt.include_dir)
							found.directories = found.directories.concat(res.directories);

						if(opt.include_file)
							found.files = found.files.concat(res.files);
					}
				} else {
					if(opt.include_dir) {
						if(opt.single_list)
							found.push(opt.with_stats ? getReadStats(item_path,opt,stats) : item_path);
						else
							found.directories.push(opt.with_stats ? getReadStats(item_path,opt,stats) : item_path);
					}
				}
			} else if(stats.isFile()) {
				if(opt.include_file) {
					if(opt.single_list)
						found.push(opt.with_stats ? getReadStats(item_path,opt,stats) : item_path);
					else
						found.files.push(opt.with_stats ? getReadStats(item_path,opt,stats) : item_path);
				}
			}
		}
	}

	return found;
}

class Dir {
	constructor() {

	}

	/**
	 *
	 * @param path {string}
	 * @returns {Promise<boolean>}
	 */
	static async exists(path) {
		try {
			let stats = await nLStat(path);

			return stats.isDirectory();
		} catch(err) {
			return false;
		}
	}

	/**
	 *
	 * @param path {string}
	 * @returns {boolean}
	 */
	static existsSyc(path) {
		try {
			let stats = nFS.lstatSync(path);

			return stats.isDirectory();
		} catch (err) {
			return false;
		}
	}

	/**
	 *
	 * @param path {string}
	 * @param opt  {read_default=}
	 * @returns {Promise<found>}
	 */
	static async read(path,opt = {}) {
		opt = merge({},read_default,opt);

		return await rRead(path,opt);
	}

	/**
	 *
	 * @param path {string}
	 * @param opt  {read_default=}
	 * @returns {found}
	 */
	static readSync(path,opt = {}) {
		opt = merge({},read_default,opt);

		return rReadSync(path,opt);
	}

	/**
	 *
	 * @param path {string}
	 * @param mode {string=}
	 * @returns {Promise<void>}
	 */
	static async make(path,mode) {
		let parse = nPath.parse(path);
		let check = parse.root;
		let parts = nPath.join(parse.dir.replace(parse.root,''),parse.base).split(nPath.sep);

		for(let part of parts) {
			check = nPath.join(check,part);

			if(!await Dir.exists(check)) {
				await nMkDir(check,mode);
			}
		}
	}

	/**
	 *
	 * @param path {string}
	 * @param mode {string=}
	 */
	static makeSync(path,mode) {
		let parse = nPath.parse(path);
		let check = parse.root;
		let parts = nPath.join(parse.dir.replace(parse.root,''),parse.base).split(nPath.sep);

		for(let part of parts) {
			check = nPath.join(check,part);

			if(!Dir.existsSyc(check)){
				nFS.mkdirSync(check,mode);
			}
		}
	}

	/**
	 *
	 * @param path     {string}
	 * @param rm_files {boolean=}
	 * @returns {Promise<boolean>}
	 */
	static async remove(path,rm_files = false) {
		let contents = await Dir.read(path,{depth:-1});

		if(contents.files.length !== 0 && !rm_files)
			return false;
		else {
			for(let file of contents.files) {
				await File.remove(file)
			}

			for(let dir of reverse(contents.directories)) {
				await nRmDir(dir);
			}

			await nRmDir(path);
		}
	}
}

module.exports = Dir;
