const db = require('modules/psql');
const util = require('modules/psql/util');

const id_path = '/:id([0-9]{1,})';

module.exports = [
	[
		{
			path: id_path,
			methods: 'get'
		},
		async (req,res) => {
			let con = null;

			try {
				con = await db.connect();

				let query = `
				select
					users.id,
					users.username,
					users.email,
					users.permissions,
					users.type,
					users.fname as name__first,
					users.lname as name__last,
					group_members.group_name as groups,
					sections.id as sections__id,
					sections.title as sections__title,
					sections.num as sections__num,
					sections.year as sections__year,
					sections.semester as sections__semester,
					images.id as images__id,
					images.image_name as images__name,
					images.options as images__options,
					images.image_type as images__type,
					images.dockerfile as images__dockerfile
				from users
				join group_members on
					users.id = group_members.user_id
				join enrolled on
					users.id = enrolled.users_id
				join sections on
					enrolled.section_id = sections.id
				join images on
					users.id = images.image_owner
				where
					users.id = ${req.params.id}
				order by
					users.id
				limit 1`;

				let result = await con.query(query);

				let rows = db.util.createObject(result.rows,{
					'array_keys':['groups','sections','images']
				});

				if(rows.length > 0) {
					await res.endJSON(rows[0]);
				} else {
					await res.endJSON(401,{
						'message': 'user id not found in database'
					});
				}

				con.release();
			} catch(err) {
				if(con)
					con.release();

				await res.endError(err);
			}
		}
	],
	[
		{
			path: id_path,
			methods: 'delete'
		},
		async (req,res) => {
			let con = null;

			try {
				let pool = db.getPool();
				con = await pool.connect();

				let query = `
				delete from users
				where
					id = ${req.params.id}
				returning
					id,
					username,
					email,
					permissions,
					type,
					name__fname,
					name__lname`;

				let result = await con.query(query);
				let rows = util.createObject(result.rows);

				if(rows.length === 1) {
					await res.endJSON(rows);
				} else {
					await res.endJSON(400,{
						'message': 'unable to delete user'
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