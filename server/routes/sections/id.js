const db = require('modules/psql');

const isJsonContent = require('modules/middleware/isJsonContent');
const parser = require('modules/parser');

const id_path = '/:id([0-9]+)';

module.exports = [
	[
		{
			path: id_path,
			methods: "put"
		},
		isJsonContent(),
		async (req,res) => {
			let con = null;

			try {
				con = await db.connect();

				let body = await parser.json(req);
				let updates = new db.util.QueryBuilder();

				if(typeof body.title === 'string') {
					updates.strField('title',body.title);
				}

				if(typeof body.num === 'number') {
					updates.numField('num',body.num);
				}

				if(typeof body.year === 'number') {
					updates.numField('year',body.year);
				}

				if(typeof body.semester === 'string') {
					updates.strField('semester',body.semester);
				}

				if(typeof body.teacher_id === 'number') {
					updates.numField('teacher_id',body.teacher_id);
				}

				let update_query = `
				update sections
				set ${updates.getInsertStr()}
				where id = ${req.params.id}
				returning *
				`;

				let result = await con.query(update_query);

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
			path: id_path,
			methods: 'delete'
		},
		async (req,res) => {
			let con = null;

			try {
				con = await db.connect();

				let delete_query = `
				delete from sections
				where id = ${req.params.id}
				returning *
				`;

				let result = await con.query(delete_query);

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
	]
];