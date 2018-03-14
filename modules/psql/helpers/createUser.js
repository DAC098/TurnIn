const _ = require('lodash');

const db = require('../index');
const security = require('../../security');

const variables = require('../../variables');

const createUser = async (user,body) => {
	let con = null;

	try {
		let pool = db.getPool();
		con = await pool.connect();

		let insert_fields = [];
		let insert_values = [];

		if(body.username) {
			let username_check = await con.query(`select * from users where username = '${body.username}'`);

			if(username_check.rows.length !== 0) {
				return {
					success: false,
					reason: 'username already used',
					user: undefined
				};
			}

			insert_fields.push('username');
			insert_values.push(`'${body.username}'`);
		} else {
			return {
				success: false,
				reason: 'no username given',
				user: undefined
			};
		}

		if(body.password) {
			let salt = security.genSalt();
			let password = security.genHash(body.password,salt);

			insert_fields.push('password');
			insert_values.push(`'${password}'`);

			insert_fields.push('salt');
			insert_values.push(`'${salt}'`);
		} else {
			return {
				success: false,
				reason: 'no password given',
				user: undefined
			};
		}

		if(body.email) {
			let email_check = await con.query(`select * from users where email = '${body.email}'`);

			if(email_check.rows.length !== 0) {
				return {
					success: false,
					reason: 'email already used',
					user: undefined
				}
			}

			insert_fields.push('email');
			insert_values.push(`'${body.email}'`);
		}

		if(body.type) {
			if(!(body.type in variables.user_type_map)) {
				return {
					success: false,
					reason: 'invalid user type given: ' + body.type,
					user: undefined
				};
			}

			if(variables.user_type_map[body.type] < variables.user_type_map[user.type]) {
				return {
					success: false,
					reason: 'you cannot create a user that is higher than you',
					user: undefined
				};
			}

			insert_fields.push('type');
			insert_values.push(`'${body.type}'`);
		} else {
			insert_fields.push('type');
			insert_values.push("'user'");
		}

		if(body.is_student) {
			insert_fields.push('is_student');
			insert_values.push(!!body.is_student);
		}

		if(body.is_teacher) {
			insert_fields.push('is_teacher');
			insert_values.push(!!body.is_teacher);
		}

		if(typeof body.fname === 'string' && typeof body.lname === 'string') {
			insert_fields.push('fname');
			insert_values.push(`'${body.fname}'`);

			insert_fields.push('lname');
			insert_values.push(`'${body.lname}'`);
		}

		if(body.permissions) {
			insert_fields.push('permissions');
			insert_values.push(`'${JSON.stringify(_.merge({},variables.default_permissions,body.permissions))}'`);
		} else {
			insert_fields.push('permissions');
			insert_values.push(`'${JSON.stringify(variables.default_permissions)}'`);
		}

		let query = `
				insert into users (${insert_fields.join(',')}) values (${insert_values.join(',')})
				returning
					id,
					username,
					email,
					permissions,
					type,
					is_student,
					is_teacher,
					fname,
					lname`;

		let result = await con.query(query);

		if(result.rows.length === 1) {
			return {
				success: true,
				reason: '',
				user: result.rows[0]
			}
		} else {
			return {
				success: false,
				reason: 'server was unable to create the user'
			}
		}
	} catch(err) {
		if(con)
			con.release();

		throw err;
	}
};

module.exports = createUser;