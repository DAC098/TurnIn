const _ = require('lodash');

const db = require('../index');
const util = require('../util');
const security = require('../../security');

const variables = require('../../variables');

/**
 *
 * @param user {Object}
 * @param body {{
 *     username: string,
 *     password: string,
 *     email: string=,
 *     type: variables.user_type_map=,
 *     is_student: boolean=,
 *     is_teacher: boolean=,
 *     fname: string=,
 *     lname: string=,
 *     permissions: variables.default_permissions=
 * }}
 * @param con  {SQLConnection=}
 * @returns {Promise<{success: boolean,reason: string,user: Object|undefined}>}
 */
const createUser = async (user,body,con) => {
	let given_con = con !== null && con !== undefined;

	try {
		if(!given_con)
			con = await db.connect();

		let insert_fields = [];
		let insert_values = [];

		if(body.username) {
			let username_check = await con.query(`select * from users where username = '${body.username}'`);

			if(username_check.rows.length !== 0) {
				if(!given_con)
					con.release();

				return {
					success: false,
					reason: 'username already used',
					user: undefined
				};
			}

			insert_fields.push('username');
			insert_values.push(`'${body.username}'`);
		} else {
			if(!given_con)
				con.release();

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
			if(!given_con)
				con.release();

			return {
				success: false,
				reason: 'no password given',
				user: undefined
			};
		}

		if(body.email) {
			let email_check = await con.query(`select * from users where email = '${body.email}'`);

			if(email_check.rows.length !== 0) {
				if(!given_con)
					con.release();

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
				if(!given_con)
					con.release();

				return {
					success: false,
					reason: 'invalid user type given: ' + body.type,
					user: undefined
				};
			}

			if(variables.user_type_map[body.type] < variables.user_type_map[user.type]) {
				if(!given_con)
					con.release();

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
			insert_values.push(typeof body.is_student === 'boolean' ? body.is_student : !!body.is_student);
		}

		if(body.is_teacher) {
			insert_fields.push('is_teacher');
			insert_values.push(typeof body.is_teacher === 'boolean' ? body.is_teacher : !!body.is_teacher);
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
					fname as name__first,
					lname as name__last`;

		let result = await con.query(query);
		let rows = util.createObject(result.rows);

		if(rows.length === 1) {
			if(!given_con)
				con.release();

			return {
				success: true,
				reason: '',
				user: rows[0]
			}
		} else {
			if(!given_con)
				con.release();

			return {
				success: false,
				reason: 'server was unable to create the user',
				user: undefined
			}
		}
	} catch(err) {
		if(con && !given_con)
			con.release();

		throw err;
	}
};

module.exports = createUser;