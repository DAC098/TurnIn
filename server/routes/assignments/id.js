const db = require('modules/psql');

const isJsonContent = require('modules/middleware/isJsonContent');
const parser = require('modules/parser');
const log = require('modules/log');

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

				let query = `
				select 
					assignments.*,
					assignment_files.filename as files__name,
					images.id as images__id,
					images.image_name as images__name,
					images.options as images__options,
					images.image_type as images__type,
					images.image_status as images__status
				from assignments
				join assignment_files on
					assignment_files.assignment_id = assignments.id
				join assignment_images on 
					assignment_images.assignment_id = assignments.id
				join images on
					images.id = assignment_images.image_id
				where
					assignments.id = ${req.params.id}
				order by
					assignments.title`;

				let result = await con.query(query);
				let parse_rows = db.util.createObject(result.rows,{array_keys:['files','images']});

				await res.endJSON({
					'length': parse_rows.length,
					'result': parse_rows
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