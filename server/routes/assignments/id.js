const n_path = require('path');

const db = require('modules/psql');
const setup = require('modules/setup');

const isJsonContent = require('modules/middleware/isJsonContent');
const parser = require('modules/parser');
const Dir = require('modules/fs/Dir');
const log = require('modules/log');

const getAssignmentData = require('modules/psql/helpers/getAssignmentData');

const id_assignment_path = '/:id([0-9]+)';

module.exports = [
	[
		{
			path: id_assignment_path,
			methods: 'get'
		},
		async (req,res) => {
			let con = null;

			try {
				con = await db.connect();

				let result = await getAssignmentData(req.params.id,con);
				let found = result !== undefined;

				await res.endJSON({
					'length': found ? 1 : 0,
					'result': found ? [result] : []
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
			path: id_assignment_path,
			methods: 'put'
		},
		isJsonContent(),
		async (req,res) => {
			let con = null;

			try {
				con = await db.connect();

				/**
				 * @type {{
				 *     title: string=,
				 *     section_id: number=,
				 *     description: string=,
				 *     points: number=,
				 *     open_date: string=,
				 *     close_date: string=
				 * }}
				 */
				let section_data = await parser.json(req);
				let update_values = [];

				if(typeof section_data.title === 'string') {
					update_values.push(`title = '${section_data.title}'`);
				}

				if(typeof section_data.section_id === 'number') {
					update_values.push(`section_id = ${section_data.section_id}`);
				}

				if(typeof section_data.description === 'string') {
					update_values.push(`description = '${section_data.description}'`);
				}

				if(typeof section_data.points === 'number') {
					update_values.push(`points = ${section_data.points}`);
				}

				if(typeof section_data.open_date === 'string') {
					let date = new Date(section_data.open_date);
					update_values.push(`open_date = '${date.toUTCString()}'`);
				}

				if(typeof section_data.close_date === 'string') {
					let date = new Date(section_data.close_date);
					update_values.push(`close_date = '${date.toUTCString()}'`);
				}

				let query = `
				update assignments
				set ${update_values.join(',')}
				where id = ${req.params.id}
				returning *
				`;

				await con.beginTrans();

				let result = await con.query(query);

				await con.commitTrans();

				await res.endJSON({
					'length': result.rows.length,
					'result': result.rows
				});
			} catch(err) {
				if(con)
					await con.rollbackTrans();

				await res.endError(err);
			}

			if(con)
				con.release();
		}
	],
	[
		{
			path: id_assignment_path,
			methods: 'delete'
		},
		async (req,res) => {
			let con = null;

			try {
				con = await db.connect();

				let query = `
				delete from assignments
				where id = ${req.params.id}
				returning *`;

				await con.beginTrans();

				let result = await con.query(query);

				await Dir.remove(n_path.join(
					setup.getKey('directories.data_root'),
					'assignments',
					`${req.params.id}`
				),true);

				await con.commitTrans();

				await res.endJSON({
					'length': result.rows.length,
					'result': result.rows
				});
			} catch(err) {
				if(con)
					await con.rollbackTrans();

				await res.endError(err);
			}

			if(con)
				con.release();
		}
	]
];