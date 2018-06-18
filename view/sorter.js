/**
 * given two objects, this will travers both objects to find the value given
 * by name. if name is not given then it will return a and b
 * @param a      {object|*} the object to traverse
 * @param b      {object|*} same as a
 * @param [name] {string} the key path to follow, ex: path.to.key
 * @returns {{a: *, b: *}} the values attained from the traverse, values will
 * null if not found
 */
export function getValues(a,b,name = '') {
	let a_value = a;
	let b_value = b;
	let count = 0;
	let name_array = name.split('.');

	if(name.length !== 0 && typeof name === 'string') {
		while(count !== name_array.length) {
			if(a_value && name_array[count].length && name_array[count] in a_value)
				a_value = a_value[name_array[count]];
			else
				a_value = null;

			if(b_value && name_array[count].length && name_array[count] in b_value)
				b_value = b_value[name_array[count]];
			else
				b_value = null;

			++count;
		}
	}

	return {a:a_value,b:b_value};
}

/**
 * will compare two values as strings and return the result of the comparison,
 * accounts for possibility of invalid values
 * @param a_val  {string|object} the value to compare or the object to traverse
 * @param b_val  {string|object} same as a_val
 * @param [name] {string}        the key path to find
 * @returns {number} the result of the comparison
 */
export function sortByStr(a_val, b_val, name) {
	let {a,b} = getValues(a_val,b_val,name);
	if(typeof a === 'string') {
		if(typeof b === 'string')
			return a.localeCompare(b);
		else
			return -1;
	} else {
		if(typeof b === 'string')
			return 1;
		else
			return 0;
	}
}

/**
 * will compare two values as numbers to see which one is larger or smaller,
 * accounts for possibility of invalid values
 * @param a_val  {number|object} the value to compare or the object to traverse
 * @param b_val  {number|object} same as a_val
 * @param [name] {string}        the key path to find
 * @returns {number} the result of the comparison
 */
export function sortByNum(a_val, b_val, name) {
	let {a,b} = getValues(a_val,b_val,name);
	if(typeof a === 'number') {
		if(typeof b === 'number') {
			if(a > b)
				return 1;
			else if(a === b)
				return 0;
			else
				return -1;
		} else {
			return -1;
		}
	} else {
		if(typeof b === 'number') {
			return 1;
		} else {
			return 0;
		}
	}
}

/**
 * will compare two values as booleans to see which is true or false, accounts
 * for the possibility of invalid values
 * @param a_val  {boolean|object} the value to compare or the object to
 *                                traverse
 * @param b_val  {boolean|object} same as a_val
 * @param [name] {string}         the key path to find
 * @returns {number} the result of the comparison
 */
export function sortByBool(a_val,b_val,name) {
	let {a,b} = getValues(a_val,b_val,name);
	if(typeof a === 'boolean') {
		if(typeof b === 'boolean') {
			if(a && b || !a && !b)
				return 0;
			else if(a && !b)
				return 1;
			else
				return -1;
		} else {
			return 1;
		}
	} else {
		if(typeof b === 'boolean')
			return -1;
		else
			return 0;
	}
}