const db = require('../index');
const security = require('../../security');

const validUser = async (username,password) => {
	let con  = null;

	try {
		let pool = db.getPool();
		con = await pool.connect();
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
		if(con)
			con.release();

		throw err;
	}
};

module.exports = validUser;