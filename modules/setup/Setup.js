const util = require('util');

const _ = require('lodash');

const data_sym = Symbol('data');

/**
 * @struct
 */
class Setup {
	/**
	 * @constructor
	 * @param default_data
	 */
	constructor(default_data) {
		this[data_sym] = _.cloneDeep(default_data);
	}

	/**
	 *
	 * @param key_str {string}
	 * @param value   {*}
	 * @returns {boolean}
	 */
	setKey(key_str,value) {
		let path = typeof key_str === 'string' ? key_str.split('.') : [];
		let ref = this[data_sym];

		for(let i = 0, l = path.length; i < l - 1; ++i) {
			if(!(path[i] in ref)) {
				return false;
			}

			ref = ref[path[i]];
		}

		if(path.length > 1 && path[path.length - 1] in ref) {
			ref[path[path.length - 1]] = value;
			return true;
		} else {
			return false;
		}
	}

	/**
	 *
	 * @param key_str {string}
	 * @param obj     {Object}
	 */
	setObj(key_str,obj) {
		let path = typeof key_str === 'string' ? key_str.split('.') : [];
		let ref = this[data_sym];

		for(let i = 0, l = path.length; i < l - 1; ++i) {
			if(!(path[i] in ref))
				ref[path[i]] = {};

			ref = ref[path[i]];
		}

		ref = _.merge({},ref,obj);
	}

	/**
	 *
	 * @param key_str {string}
	 * @returns {*}
	 */
	getKey(key_str) {
		let path = key_str.split('.');
		let ref = this[data_sym];

		for (let i = 0, l = path.length; i < l - 1; ++i) {
			if(!(path[i] in ref)) {
				return undefined;
			}

			ref = ref[path[i]];
		}

		if(ref[path[path.length - 1]] !== null && ref[path[path.length - 1]] !== undefined && path[path.length - 1] in ref)
			return _.cloneDeep(ref[path[path.length - 1]]);
		else
			return undefined;
	}

	/**
	 *
	 * @returns {Object}
	 */
	get() {
		return _.cloneDeep(this[data_sym]);
	}
}

module.exports = Setup;
