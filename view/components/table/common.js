/**
 * will check if a given index has been overridden, determined by the list
 * given. view_override follows this specific pattern where used
 * @param view_override {*[]}    the list of index that are overridden
 * @param index         {number} the index to check
 * @returns {boolean} true if the index is overridden, otherwise false
 */
export function checkIndexIfViewOverridden(view_override,index) {
	for(let override of view_override) {
		if(typeof override === 'number' || typeof override === 'string') {
			if(override === index)
				return true;
		} else {
			if(typeof override.active === 'boolean') {
				if(!override.active && override.index === index)
					return true;
			} else {
				if(override.index === index)
					return true;
			}
		}
	}

	return false;
}

/**
 * used to get the value of an key from the name provided from the object given
 * @param name {string} the key path to follow
 * @param obj  {object} the object to traverse
 * @returns {*} the value found at the key path, null if not found
 */
export function getValue(name,obj) {
	let name_array = name.split('.');
	let ref = obj;

	for(let i = 0,len = name_array.length; i < len; ++i) {
		if(name_array[i] in ref)
			ref = ref[name_array[i]];
		else
			return null;
	}

	return ref;
}

export function loopThruCols(columns,cb) {
	if(columns instanceof Map) {
		for(let [key,col] of columns) {
			cb(key,col);
		}
	} else {
		for(let col of columns) {
			cb(col.name,col);
		}
	}
}