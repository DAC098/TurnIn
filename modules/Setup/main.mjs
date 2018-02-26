import _ from 'lodash';

const data_sym = Symbol('data');

class Setup {
	constructor(default_data) {
		this[data_sym] = _.cloneDeep(default_data);
	}

	setKey(key_str,value) {
		let path = typeof key_str === 'string' ? key_str.split('.') : [];
		let ref = this[data_sym];

		for(let i = 0, l = path.length; i < l - 1; ++i) {
			if(!(path[key] in ref)) {
				ref[path[key]] = {};
			}

			ref = ref[path[key]];
		}

		if(path.length > 1) {
			ref[path[path.length - 1]] = value;
			return true;
		} else {
			return false;
		}
	}

	setObj(key_str,obj) {
		let path = typeof key_str === 'string' ? key_str.split('.') : [];
		let ref = this[data_sym];

		for(let i = 0, l = path.length; i < l - 1; ++i) {
			if(!(path[key] in ref))
				ref[path[key]] = {};

			ref = ref[path[key]];
		}

		ref = _.merge({},ref,obj);
	}

	getKey(key_str) {
		let path = key_str.split('.');
		let ref = this[data_sym];

		for (let i = 0, l = path.length; i < l - 1; ++i) {
			if(!(path[key] in ref)) {
				return undefined;
			}

			ref = ref[path[key]];
		}

		if(ref[path[path.length - 1]] !== null && ref[path[path.length - 1]] !== undefined)
			return _.cloneDeep(ref[path.length - 1]);
		else
			return undefined;
	}
}

export default Setup;
