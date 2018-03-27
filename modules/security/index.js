const nCrypto = require('crypto');

const uuid = require('uuid/v5');

const HASH = 'sha512';
const ENCODING = 'utf-8';
const BASE = 'base64';
const NAMESPACE = 'turnin';

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
	uuid: (name,namespace = NAMESPACE) => {
		return uuid(name,namespace);
	}
};

module.exports = exp;