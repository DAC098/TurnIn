const db = require('modules/psql');

const isJsonContent = require('modules/middleware/isJsonContent');
const parser = require('modules/parser');

const id_students_path = '/:id([0-9]+)/enrolled';

module.exports = [
	[
		{
			path: id_students_path,
			methods: 'get'
		},
		async (req,res) => {
			let con = null;

			try {
				con = await db.connect();

				let query = `
				select
					users.username,
					users.fname as name__first,
					users.lname as name__last,
					users.id,
					users.email,
					users.permissions,
					users.type,
					users.is_student,
					users.is_teacher
				from users
				join enrolled on
					enrolled.users_id = users.id
				join sections on
					sections.id = enrolled.section_id
				where
					sections.id = ${req.params.id}
				order by
					users.username`;

				let result = await con.query(query);

				await res.endJSON({
					'length': result.rows.length,
					'result': result.rows
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
			path: id_students_path,
			methods: 'post'
		},
		isJsonContent(),
		async (req,res) => {
			let con = null;

			try {
				con = await db.connect();
				let body = await parser.json(req);
				let ids = [];

				await con.beginTrans();

				if(body.ids) {
					for(let id of body.ids) {
						if(typeof id === 'number')
							ids.push(id);
					}
				}

				let query = `
				insert into enrolled (
					select id, ${req.params.id} from users where id in (${ids.join(',')})
				)
				on conflict on constraint pk_enrolled do nothing
				returning
					*
				`;

				let result = await con.query(query);

				await con.commitTrans();

				await res.endJSON({
					'length': result.rows.length,
					'result': result.rows
				});
			} catch(err) {
				await con.rollbackTrans();

				await res.endError(err);
			}

			if(con)
				con.release();
		}
	],
	[
		{
			path: id_students_path,
			methods: 'delete'
		},
		isJsonContent(),
		async (req,res) => {
			let con = null;

			try {
				con = await db.connect();
				let body = await parser.json(req);
				let ids = [];

				if(body.ids) {
					for(let id of body.ids)
						if(typeof id === 'number')
							ids.push(id);
				}

				let query = `
				delete from enrolled
				where users_id in (${ids.join(',')}) and section_id = ${req.params.id}
				returning *`;

				await con.beginTrans();

				let result = await con.query(query);

				await con.commitTrans();

				await res.endJSON({
					'length': result.rows.length,
					'result': result.rows
				});
			} catch(err) {
				await con.rollbackTrans();
				await res.endError(err);
			}

			if(con)
				con.release();
		}
	]
];