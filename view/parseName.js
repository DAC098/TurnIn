/**
 *
 * @param string
 * @returns {*}
 */
export function createStr(string) {
	let split = string.split('.');
	for(let i = 0,len = split.length; i < len; ++i) {
		split[i] = `${split[i].charAt(0).toUpperCase()}${split[i].substring(1)}`;
	}
	return split.length > 1 ? split.join(' ') : split[0];
}

/**
 * creates a name from the given object, if the object has a key called
 * friendly it will be returned, if there is no friendly key then it will
 * use the name key and parse what it finds
 * @param obj   {{
 *     friendly: string
 *     name: string
 * }} the object to get a name from
 * @returns {string} the parsed name
 */
export function parseName(obj) {
	if(obj.friendly) {
		return obj.friendly;
	} else if(obj.name) {
		let name_str = typeof obj === 'string' ? obj : obj.name;
		let name_array = name_str.split('.');

		for(let i = 0,len = name_array.length; i < len; ++i) {
			name_array[i] = `${name_array[i].charAt(0).toUpperCase()}${name_array[i].substring(1)}`;
		}

		return name_array.length > 1 ? name_array.join(' ') : name_array[0];
	}
}

export default parseName;