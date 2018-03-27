const nCrypto = require('crypto');

const uuidV4 = require('uuid/v4');
const uuidV5 = require('uuid/v5');

const HASH = 'sha512';
const ENCODING = 'utf-8';
const BASE = 'base64';
const NAMESPACE = [12,84,52,34,124,63,74,95,120,210,184,2,16,14,132,23];

const exp = {
	genSalt: (size = 256,type = BASE) => {
		let buffer = nCrypto.randomBytes(size);
		return buffer.toString(type);
	},
	genHash: (string, salt) => {
		let hash = nCrypto.createHmac(HASH, salt);
		hash.update(string);
		return hash.digest(BASE);
	},
	uuidV5 : (name, namespace = NAMESPACE) => {
		return uuidV5(name,namespace);
	},
	uuidV4 : (options,buffer,offset) => {
		return uuidV4(options,buffer,offset);
	}
};

module.exports = exp;