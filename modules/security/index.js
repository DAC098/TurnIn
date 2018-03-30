const nCrypto = require('crypto');

const uuidV4 = require('uuid/v4');
const uuidV5 = require('uuid/v5');

/**
 *
 * @type {string}
 */
const HASH = 'sha512';
/**
 *
 * @type {string}
 */
const ENCODING = 'utf-8';
/**
 *
 * @type {string}
 */
const BASE = 'base64';
/**
 *
 * @type {number[]}
 */
const NAMESPACE = [12,84,52,34,124,63,74,95,120,210,184,2,16,14,132,23];

const exp = {
	/**
	 *
	 * @param size {number}
	 * @param type {string}
	 * @returns {string}
	 */
	genSalt: (size = 256,type = BASE) => {
		let buffer = nCrypto.randomBytes(size);
		return buffer.toString(type);
	},
	/**
	 *
	 * @param string {string}
	 * @param salt   {string}
	 * @returns {PromiseLike<ArrayBuffer>}
	 */
	genHash: (string, salt) => {
		let hash = nCrypto.createHmac(HASH, salt);
		hash.update(string);
		return hash.digest(BASE);
	},
	/**
	 *
	 * @param name      {string}
	 * @param namespace {Array<number>}
	 * @returns {string}
	 */
	uuidV5 : (name, namespace = NAMESPACE) => {
		return uuidV5(name,namespace);
	},
	/**
	 *
	 * @param options {Object}
	 * @param buffer  {Buffer}
	 * @param offset  {number}
	 * @returns {string|Buffer}
	 */
	uuidV4 : (options,buffer,offset) => {
		return uuidV4(options,buffer,offset);
	}
};

module.exports = exp;