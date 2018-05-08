const security = require('../../security');

/**
 *
 * @param username {string}
 * @param password {string}
 * @param con      {SQLConnection}
 * @returns {Promise<*>}
 */
const validUser = async (username,password,con) => {
	try {
		let query = `select * from users where username = '${username}'`;

		let res = await con.query(query);

		con.release();

		if(res.rows.length === 1) {
			let user = res.rows[0];

			let salt = user.salt;
			let p = user.password;

			let hashed_password = security.genHash(password,salt);

			if(hashed_password === p) {
				return {
					success: true,
					username: true,
					password: true,
					user
				};
			} else {
				return {
					success: false,
					username: true,
					password: false,
					user: undefined
				};
			}
		} else {
			return {
				success: false,
				username: false,
				password: false,
				user: undefined
			}
		}
	} catch(err) {
		throw err;
	}
};

module.exports = validUser;