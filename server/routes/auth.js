const db = require("modules/psql");
const parser = require('modules/parser');

const validUser = require("modules/psql/helpers/users/validUser");

module.exports = [
	[
		{
			path: '/auth',
			methods: 'post'
		},
		async (req,res) => {
			let con = null;

			try {
				let con = await db.connect();
				let body = await parser.json(req);

				let result = await validUser(body.username,body.password,con);

				con.release();

				if(result.success) {
					await res.endJSON({
						'message':'successful'
					});
				} else {
					await res.endJSON(401,{
						'username': result.username,
						'password': result.password
					});
				}
			} catch(err) {
				if(con)
					con.release();

				await res.endError(err);
			}
		}
	]
];