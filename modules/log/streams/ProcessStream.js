const nUtil = require('util');

class ProcessStream {
	constructor() {
		this.stdout = process.stdout;
		this.stderr = process.stderr;
	}

	log(...args) {
		this.stdout.write(nUtil.format.apply(null,args));
	}
}

module.exports = ProcessStream;