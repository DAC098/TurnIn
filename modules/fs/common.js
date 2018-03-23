const minimatch = require('minimatch');

/**
 *
 * @param inspect {string}
 * @param check   {Array<string|RegExp>|string|RegExp}
 * @returns {boolean}
 */
function runCheck(inspect,check) {
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

exports.runcheck = runCheck;