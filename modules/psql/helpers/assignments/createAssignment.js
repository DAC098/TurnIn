const n_path = require('path');

const _ = require('lodash');

const File = require('modules/fs/File');
const Dir = require('modules/fs/Dir');

const setup = require('modules/setup');
const db = require('modules/psql');
const log = require('modules/log');
const variables = require('modules/variables');

/**
 *
 * @param user {Object}
 * @param body {{
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
 * @param con {SQLConnection}
 * @returns {Promise<{
 *     success: boolean
 *     reason: string=
 *     assignment: Object=
 * }>}
 */
const createAssignment = async (user,body,con) => {
	let inserts = new db.util.QueryBuilder();

	if(typeof body.title === 'string' && typeof body.section_id === 'number') {
		let check_query = `
		select *
		from assignments
		where
			title = '${body.title}' and
			section_id = ${body.section_id}`;

		let check_res = await con.query(check_query);

		if(check_res.rows.length !== 0) {
			return {
				success: true,
				reason: 'assignment already exists',
				assignment: check_res.rows[0]
			};
		}

		inserts.strField('title',body.title);
		inserts.numField('section_id',body.section_id);
	} else {
		let msg = '';
		let missing_title = false;

		if(typeof body.title !== 'string') {
			missing_title = true;
			msg += 'title'
		}

		if(typeof body.section_id !== 'number') {
			msg += missing_title ? ' and section_id' : 'section_id';
		}

		msg += missing_title ? ' are' : ' is' + 'required for assignment';

		return {
			success: false,
			reason: msg
		};
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

		return {
			success: true,
			assignment: result.rows[0]
		};
	} else {
		return {
			success: false,
			reason: 'unable to create assignment'
		};
	}
};

module.exports = createAssignment;