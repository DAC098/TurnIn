const nCrypto = require('crypto');

const HASH = 'sha512';
const ENCODING = 'utf-8';
const BASE = 'base64';

const exp = {
	genSalt: (size = 256,type = BASE) => {
		let buffer = nCrypto.randomBytes(size);
		return buffer.toString(type);
	},
	genHash: (string, salt) => {
		let hash = nCrypto.createHmac(HASH, salt);
		hash.update(string);
		return hash.digest(BASE);
	}
};

module.exports = exp;