const nFS = require('fs');
const nPath = require('path');
const nUtil = require('util');
const jsYaml = require('js-yaml');
const pump = require('pump');

const nLStat = nUtil.promisify(nFS.lstat);

const nReadFile = nUtil.promisify(nFS.readFile);
const nWriteFile = nUtil.promisify(nFS.writeFile);
const nUnlinkFile = nUtil.promisify(nFS.unlink);

class File {
	constructor(path) {

	}

	/**
	 *
	 * @param path {string}
	 * @returns {Promise<fs.Stats>}
	 */
	static async stats(path) {
		return await nLStat(path);
	}

	/**
	 *
	 * @param path {string}
	 * @returns {fs.Stats}
	 */
	static statsSync(path) {
		return nFS.lstatSync(path);
	}

	/**
	 *
	 * @param path {string}
	 * @returns {Promise<boolean>}
	 */
	static async exists(path) {
		try {
			let stats = await File.stats(path);

			return stats.isFile();
		} catch(err) {
			return false;
		}
	}

	/**
	 *
	 * @param path {string}
	 * @returns {boolean}
	 */
	static existsSync(path) {
		try {
			let stats = File.statsSync(path);

			return stats.isFile();
		} catch(err) {
			return false;
		}
	}

	/**
	 *
	 * @param path    {string}
	 * @param options {Object=}
	 * @returns {Promise<string>}
	 */
	static async read(path,options) {
			if(await File.exists(path))
				return nReadFile(path,options);
			else
				return '';
	}

	/**
	 *
	 * @param path    {string}
	 * @param options {Object=}
	 * @returns {string}
	 */
	static readSync(path,options) {
		if(File.existsSync(path))
			return nFS.readFileSync(path,options);
		else
			return '';
	}

	/**
	 *
	 * @param path    {string}
	 * @param data    {string}
	 * @param options {Object=}
	 * @returns {Promise<void>}
	 */
	static async write(path,data,options) {
		let write = typeof data.then === 'function' ? await data : data;
		await nWriteFile(path,write,options);
	}

	/**
	 *
	 * @param path    {string}
	 * @param data    {string}
	 * @param options {Object=}
	 */
	static writeSync(path,data,options) {
		nFS.writeFileSync(path,data,options);
	}

	/**
	 *
	 * @param path {string}
	 * @returns {Promise<boolean>}
	 */
	static async remove(path) {
			if(await File.exists(path))
				await nUnlinkFile(path);

			return true;
	}

	/**
	 *
	 * @param path {string}
	 * @returns {boolean}
	 */
	static removeSync(path) {
		if(File.existsSync(path))
			nFS.unlinkSync(path);

		return true;
	}

	/**
	 *
	 * @param path {string}
	 * @returns {Promise<Object>}
	 */
	static async loadYaml(path) {
		let data = await File.read(path);
		return jsYaml.safeLoad(data);
	}

	/**
	 *
	 * @param path {string}
	 * @returns {Object}
	 */
	static loadYamlSync(path) {
		let data = File.readSync(path);
		return jsYaml.safeLoad(data);
	}

	/**
	 *
	 * @param current_path {string}
	 * @param new_path     {string}
	 * @returns {Promise<void>}
	 */
	static copy(current_path, new_path) {
		return new Promise((resolve,reject) => {
			let read_stream = nFS.createReadStream(current_path);
			let write_stream = nFS.createWriteStream(new_path);

			pump(read_stream,write_stream,err => {
				if(err)
					reject(err);
				else
					resolve();
			});
		});
	}
}

module.exports = File;