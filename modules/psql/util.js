const _ = require('lodash');

const to_object_defaults = {
	array_keys: [],
	id_field: 'id',
	field_separator: '__'
};

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