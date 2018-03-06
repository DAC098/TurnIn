class ConsoleStream {
	constructor() {

	}

	log(...args) {
		console.log(...args);
	}

	debug(...args) {
		console.log(...args);
	}

	perf(...args) {
		console.log(...args);
	}

	warn(...args) {
		console.warn(...args);
	}

	error(...args) {
		console.error(...args);
	}
}

module.exports = ConsoleStream;