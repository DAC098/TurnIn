const _ = require('lodash');

/**
 *
 * @param field  {string[]}
 * @param value  {*}
 * @param object {Object}
 * @param count  {number=}
 */
const addField = (field,value,object,count = 0) => {
	// if the field length is only one then assign the value to the key
	if(field.length === 1) {
		object[field[0]] = value;
		return object;
	}

	// check to make sure that the object will hold the field exists
	if(!(field[count] in object)) {
		object[field[count]] = {};
	}

	// if the next value is the final one then add it
	if(field.length - 2 === count) {
		object[field[count]][field[count + 1]] = value;
		return object;
	}

	object[field[count]] = addField(field,value,object[field[count]],++count);

	return object;
};

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
			r_id = opts.id_field
				.map(v => r[v])
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

					if(opts.array_keys.has(keys[0])) {
						array_fields.add(field);

						if(!captured_array_fields) {
							if(!(keys[0] in known_array_fields))
								known_array_fields[keys[0]] = 0;

							++known_array_fields[keys[0]];
						}

						if(!(keys[0] in curr))
							curr[keys[0]] = [];

						continue;
					}

					curr = addField(keys,r[field],curr);
				}

				curr_set = true;
				captured_array_fields = true;
			}

			curr_id = r_id;
		}

		let push = {};
		let null_count = {};

		for(let field of array_fields) {
			let keys = field.split(opts.field_separator);

			if(!(keys[0] in push)) {
				push[keys[0]] = {};
				null_count[keys[0]] = 0
			}

			if(r[field] === null || r[field] === undefined)
				++null_count[keys[0]];

			push = addField(keys,r[field],push);
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
		if(value === undefined || value === null)
			return 'NULL';

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

	typeofField(field,value) {
		switch(typeof value) {
			case 'number':
				this.numField(field,value);
				break;
			case 'boolean':
				this.boolField(field,value);
				break;
			case 'object':
				this.objField(field,value);
				break;
			case 'string':
			default:
				this.strField(field,value);
		}
	}

	objField(field,value) {
		this[inserts_sym].set(
			QueryBuilder.sanitize('string',field),
			{
				type: 'object',
				value: value
			}
		)
	}

	strField(field,value) {
		this[inserts_sym].set(
			QueryBuilder.sanitize('string',field),
			{
				type: 'string',
				value: value
			}
		);
	}

	numField(field,value) {
		this[inserts_sym].set(
			QueryBuilder.sanitize('string',field),
			{
				type: 'number',
				value: value
			}
		);
	}

	boolField(field,value) {
		this[inserts_sym].set(
			QueryBuilder.sanitize('string',field),
			{
				type: 'bool',
				value: value
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
					return `${QueryBuilder.sanitize(f.type,f.value)}`;
				case 'string':
					return `'${QueryBuilder.sanitize('string',f.value)}'`;
				case 'object':
					return `'${QueryBuilder.sanitize('string',JSON.stringify(f.value))}'`;
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

	getInsertStr() {
		let rtn = [];

		for(let [k,v] of this[inserts_sym]) {
			rtn.push(`${k} = ${this.getValueStr(k)}`);
		}

		return rtn.join(',');
	}
}

exports.QueryBuilder = QueryBuilder;