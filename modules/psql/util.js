const _ = require('lodash');

/**
 *
 * @typedef {{
 *     array_keys: Array<string>=,
 *     id_field: string=,
 *     field_separator: string=
 * }}
 */
const to_object_defaults = {
	array_keys: [],
	id_field: 'id',
	field_separator: '__'
};

/**
 *
 * @param res     {Array<Object>}
 * @param options {to_object_defaults=}
 * @returns {Object[]}
 */
const createObject = (res, options) => {
	let opts = _.merge({},to_object_defaults,options);

	opts.array_keys = new Set(Array.isArray(opts.array_keys) ? opts.array_keys : [opts.array_keys]);

	let rtn = new Map();
	let curr = {};
	let curr_id = '';
	let curr_set = false;
	let array_fields = new Set();
	let captured_array_fields = false;
	let known_array_fields = {};

	for(let r of res) {
		let r_id = '';

		if(Array.isArray(opts.id_field)) {
			r_id = opts.id_field.map(v => {
				return r[v];
			})
				.join(':');
		} else {
			r_id = r[opts.id_field];
		}

		if(r_id !== curr_id) {
			if(Object.keys(curr).length !== 0) {
				rtn.set(curr_id,curr);
				curr = rtn.get(r_id);
				curr_set = curr !== undefined;
			}

			if(!curr_set) {
				curr = {};

				for(let field in r) {
					let keys = field.split(opts.field_separator);
					let obj_ref = curr;

					if(opts.array_keys.has(keys[0])) {
						array_fields.add(field);

						if(!captured_array_fields) {
							if(!(keys[0] in known_array_fields))
								known_array_fields[keys[0]] = 0;

							++known_array_fields[keys[0]];
						}

						if(!(keys[0] in obj_ref))
							obj_ref[keys[0]] = [];

						continue;
					}

					for(let i = 0,l = keys.length - 1; i < l; ++i) {
						if(!(keys[i] in obj_ref))
							obj_ref[keys[i]] = {};

						obj_ref = obj_ref[keys[i]];
					}

					obj_ref[keys[keys.length - 1]] = r[field];
				}

				curr_set = true;
				captured_array_fields = true;
			}

			curr_id = r_id;
		}

		let push = {};
		let null_count = {};

		for(let field in r) {
			if(!(array_fields.has(field)))
				continue;

			let keys = field.split(opts.field_separator);
			let obj_ref = push;

			if(!(keys[0] in obj_ref)) {
				obj_ref[keys[0]] = {};
				null_count[keys[0]] = 0
			}

			obj_ref = obj_ref[keys[0]];

			for(let i = 1, l = keys.length - 1; i < l; ++i) {
				if(!(keys[i] in push))
					obj_ref[keys[i]] = {};

				obj_ref = obj_ref[keys[i]];
			}

			if(r[field] === null || r[field] === undefined)
				++null_count[keys[0]];

			obj_ref[keys[keys.length - 1]] = r[field];
		}

		for(let k in push) {
			if(null_count[k] !== known_array_fields[k]) {
				curr[k].push(push[k]);
			}
		}
	}

	if(res.length !== 0)
		rtn.set(curr_id,curr);


	return Array.from(rtn.values());
};

exports.createObject = createObject;

const inserts_sym = Symbol('inserts');

class QueryBuilder {
	constructor() {
		this[inserts_sym] = new Map();
	}

	static sanitize(type,value) {
		switch(type) {
			case 'string':
				let rtn = `${value}`;
				rtn = rtn
					.replace(/\\?'/g,'\'\'');
				return rtn;
			case 'bool':
				return typeof value === 'boolean' ? value : !!value;
			case 'number':
				return typeof value === 'number' ? value : parseInt(`${value}`,10);
			default:
				return value;
		}
	}

	tag(strings,...keys) {
		let str_iterator = strings[Symbol.iterator]();
		let keys_iterator = keys[Symbol.iterator]();

		let str_iter = str_iterator.next();
		let keys_iter = keys_iterator.next();

		let rtn = '';

		while(!str_iter.done && !keys_iter.done) {
			rtn += str_iter.value;

			if(typeof keys_iter.value === 'function') {
				rtn += keys_iter.value.call(null,this);
			}

			str_iter = str_iterator.next();
			keys_iter = keys_iterator.next();
		}

		return rtn;
	}



	strField(field,value) {
		this[inserts_sym].set(
			QueryBuilder.sanitize('string',field),
			{
				type: 'string',
				value: QueryBuilder.sanitize('string',value)
			}
		);
	}

	numField(field,value) {
		this[inserts_sym].set(
			QueryBuilder.sanitize('string',field),
			{
				type: 'number',
				value: QueryBuilder.sanitize('number',value)
			}
		);
	}

	boolField(field,value) {
		this[inserts_sym].set(
			QueryBuilder.sanitize('string',field),
			{
				type: 'bool',
				value: QueryBuilder.sanitize('bool',value)
			}
		);
	}

	getValue(field) {
		let rtn = this[inserts_sym].get(field);
		return rtn !== undefined ? rtn.value : undefined;
	}

	getValueStr(field) {
		let f = this[inserts_sym].get(field);

		if(f !== undefined) {
			switch(f.type) {
				case 'number':
				case 'bool':
					return `${f.value}`;
				case 'string':
					return `'${f.value}'`;
			}
		} else {
			return '';
		}
	}

	getFields() {
		return Array.from(this[inserts_sym].keys());
	}

	getFieldsStr() {
		return this.getFields().join(',');
	}

	getValues() {
		let rtn = [];

		for(let [k,v] of this[inserts_sym]) {
			rtn.push(v.value);
		}

		return rtn;
	}

	getValuesStr() {
		let rtn = [];

		for(let [k,v] of this[inserts_sym]) {
			rtn.push(this.getValueStr(k));
		}

		return rtn.join(',');
	}
}

exports.QueryBuilder = QueryBuilder;