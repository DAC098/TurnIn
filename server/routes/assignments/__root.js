const n_path = require('path');

const _ = require("lodash");

const db = require('modules/psql');
const setup = require('modules/setup');
const log = require('modules/log');
const Dir = require('modules/fs/Dir');
const File = require('modules/fs/File');
const variables = require('modules/variables');

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

				await res.endJSON(results.rows);
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
				 *     close_date: string=,
				 *     options: {
				 *         extract: string[]=,
				 *         mount_point: string=,
				 *         working_dir: string=,
				 *         exec: string[]=
				 *     }=,
				 *     tests: string=
				 * }}
				 */
				let body = await parser.json(req);
				let inserts = new db.util.QueryBuilder();

				if(typeof body.title === 'string') {
					inserts.strField('title',body.title);
				} else {
					await res.endJSON(400,{
						'message': 'title is required for the assignment'
					});
					return;
				}

				if(typeof body.section_id === 'number') {
					inserts.numField('section_id',body.section_id);
				} else {
					await res.endJSON(400,{
						'message': 'section_id is required for the assignment'
					});
					return;
				}

				if(typeof body.description === 'string') {
					inserts.strField('description',body.description);
				}

				if(typeof body.points === 'number') {
					inserts.numField('points',body.points);
				}

				if(typeof body.open_date === 'string') {
					let date = new Date(body.open_date);
					inserts.strField('open_date',date.toUTCString());
				}

				if (typeof body.close_date === 'string') {
					let date = new Date(body.close_date);
					inserts.strField('close_date',date.toUTCString());
				}

				if (typeof body.options === 'object') {
					inserts.strField('options',JSON.stringify(_.merge({},variables.default_assignment_options,body.options)));
				}

				con = await db.connect();

				await con.beginTrans();

				let query = `
				insert into assignments (${inserts.getFieldsStr()}) values
				(${inserts.getValuesStr()})
				returning *
				`;

				let result = await con.query(query);

				if(result.rows.length === 1) {
					let assignment_id = result.rows[0].id;
					let test_dir = n_path.join(
						setup.helpers.getAssignmentDir(assignment_id),
						'tests'
					);

					await Dir.make(setup.helpers.getAssignmentDir(assignment_id));
					await Dir.make(test_dir);

					try {
						if(typeof body.tests === 'string') {
							let name = n_path.join(
									test_dir,
									`main.js`
								);

							await File.write(
								name,
								body.tests
							);
						}
					} catch(err) {
						log.error(`creating test files: ${err.stack}`);
					}

					await con.commitTrans();

					await res.endJSON(result.rows[0]);
				} else {
					await res.endJSON(500,{
						'message': 'unable to create assignment'
					});
					await con.rollbackTrans();
				}
			} catch(err) {
				if(con)
					await con.rollbackTrans();

				await res.endError(err,'unable to create assignment');
			}

			if(con)
				con.release();
		}
	]
];
