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
				let pool = db.getPool();
				con = await pool.connect();

				let query = `
				select *
				from sections
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
				con = await db.connect();

				/**
				 * @type {{
				 *     title: string,
				 *     num: number,
				 *     year: number,
				 *     semester: string,
				 *     teacher_id: number
				 * }}
				 */
				let body = await parser.json(req);
				let insert_values = [
					`'${body.title}'`,
					body.num,
					body.year,
					`'${body.semester}'`,
					body.teacher_id
				];

				let insert_query = `
				insert into sections (title,num,year,semester,teacher_id) values
				(${insert_values.join(',')})
				returning *
				`;

				let result = await con.query(insert_query);

				await res.endJSON({
					'length': result.rows.length,
					'result': result.rows
				});

				con.release();
			} catch(err) {
				if(con)
					con.release();

				await res.endError(err);
			}
		}
	]
];