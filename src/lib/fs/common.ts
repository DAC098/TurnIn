import minimatch from "minimatch"

export function runCheck(inspect: string, check: Array<string|RegExp>|string|RegExp): boolean {
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