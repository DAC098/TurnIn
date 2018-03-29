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

				let update_values = [];

				if(typeof body.title === 'string')
					update_values.push(`title = '${body.title}'`);

				if(typeof body.num === 'number')
					update_values.push(`num = ${body.num}`);

				if(typeof body.year === 'number')
					update_values.push(`year = ${body.year}`);

				if(typeof body.semester === 'string')
					update_values.push(`semester = ${body.semester}`);

				if(typeof body.teacher_id === 'number')
					update_values.push(`teacher_id = ${body.teacher_id}`);

				let update_query = `
				update sections
				set ${update_values.join(',')}
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