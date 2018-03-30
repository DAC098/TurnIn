const db = require('modules/psql');

const isJsonContent = require('modules/middleware/isJsonContent');
const parser = require('modules/parser');

module.exports = [
	[
		{
			path: '/',
			methods: 'get'
		},
		async (req,res) => {
			let con = null;

			try {
				con = await db.connect();

				let query = `
				select
					*
				from assignments
				`;

				let results = await con.query(query);

				await res.endJSON({
					'length': results.rows.length,
					'result': results.rows
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
				/**
				 * @type {{
				 *     title: string,
				 *     section_id: number,
				 *     description: string,
				 *     points: number=,
				 *     open_date: string=,
				 *     close_date: string=
				 * }}
				 */
				let body = await parser.json(req);
				let insert_fields = [];
				let insert_values = [];

				if(typeof body.title === 'string') {
					insert_fields.push('title');
					insert_values.push(`'${body.title}'`);
				} else {
					await res.endJSON(400,{
						'message': 'title is required for the assignment'
					});
					return;
				}

				if(typeof body.section_id === 'number') {
					insert_fields.push('section_id');
					insert_values.push(`${body.section_id}`);
				} else {
					await res.endJSON(400,{
						'message': 'section_id is required for the assignment'
					});
					return;
				}

				if(typeof body.description === 'string') {
					insert_fields.push('description');
					insert_values.push(`'${body.description}'`);
				}

				if(typeof body.points === 'number') {
					insert_fields.push('points');
					insert_values.push(`${body.points}`);
				}

				if(typeof body.open_date === 'string') {
					let date = new Date(body.open_date);
					insert_fields.push('open_date');
					insert_values.push(`'${date.toUTCString()}'`);
				}

				if (typeof body.close_date === 'string') {
					let date = new Date(body.close_date);
					insert_fields.push('close_date');
					insert_values.push(`'${date.toUTCString()}'`);
				}

				con = await db.connect();

				let query = `
				insert into assignments (${insert_fields.join(',')}) values
				(${insert_values.join(',')})
				returning *
				`;

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
	]
];
