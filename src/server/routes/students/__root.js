const _ = require('lodash');

const db = require('modules/psql');
const util = require('modules/psql/util');
const createUser = require('modules/psql/helpers/users/createUser');

const parser = require('modules/parser');
const isJsonContent = require('modules/middleware/isJsonContent');

module.exports = [
	[
		{
			path: '/',
			methods: 'get'
		},
		async (req,res) => {
			let con = null;

			try {
				let pool = db.getPool();
				con = await pool.connect();

				let query = `
				select
					id as id,
					fname as name__first,
					lname as name__last,
					email,
					username
				from users
				where
					is_student is true
				`;

				let result = await con.query(query);

				let rtn = util.createObject(result.rows);

				await res.endJSON({
					'length': rtn.length,
					'result': rtn
				});
			} catch(err) {
				await res.endError(err);
			}

			if(con)
				con.release();
		}
	],
	[
		{
			path: '/',
			methods: 'post'
		},
		isJsonContent(),
		async (req,res) => {
			let con = null;

			try {
				let pool = db.getPool();
				con = await pool.connect();

				let body = await parser.json(req);

				let {success,returned,user} = await createUser(req.user,_.merge({},body,{type:'user',is_student:true,is_teacher:false}),con);

				if(success) {
					await res.endJSON({
						'length': 1,
						'result': [user]
					});
				} else {
					await res.endJSON(400,{
						'message': 'unable to create student'
					});
				}
			} catch(err) {
				await res.endError(err);
			}

			if(con)
				con.release();
		}
	]
];
