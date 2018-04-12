const db = require('modules/psql');
const parser = require('modules/parser');

const isJsonContent = require('modules/middleware/isJsonContent');

const id_submission_path = '/:id([0-9]+)/submissions';

module.exports = [
	[
		{
			path: id_submission_path,
			methods: 'get'
		},
		async (req,res) => {
			let con = null;

			try {
				con = await db.connect();

				let query = `
				select
					*
				from submissions
				where
					assignment_id = ${req.assignment.id}`;

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
			path: id_submission_path,
			methods: 'post'
		},
		isJsonContent(true),
		async (req,res) => {
			let con = null;

			try {
				let inserts = new db.util.QueryBuilder();
				/**
				 * @type {{
				 *     image_id: number,
				 *     options: Object=,
				 *     comment: string=,
				 * }}
				 */
				let body = await parser.json(req);

				if(typeof body.image_id === 'string') {
					inserts.numField('image_id',body.image_id);
				} else {
					await res.endJSON(400,{
						'message': 'no image given for assignment'
					});
					return;
				}

				if(typeof body.options === 'object') {
					inserts.strField('options',`${JSON.stringify(body.options)}`);
				}

				if(typeof body.comment === 'string') {
					inserts.strField('comment',body.comment);
				}

				inserts.numField('users_id',req.user.id);
				inserts.numField('assignment_id',req.assignment.id);
				inserts.boolField('past_due',false);
				inserts.strField('sub_date',(new Date()).toUTCString());

				let query = `
				insert into submissions (${inserts.getFieldsStr()}) values
				(${inserts.getValuesStr()})
				returning *`;

				con = await db.connect();

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