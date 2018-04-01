const db = require('modules/psql');

const id_files_path = '/:id([0-9]+)/files';

/**
 *
 * @param id  {number}
 * @param con {SQLConnection=}
 * @returns {Promise<Object|undefined>}
 */
const getAssignmentData = async (id,con) => {
	let should_release = false;

	try {
		if(con === null) {
			should_release = true;
			con = await db.connect();
		}

		let result = await con.query(`
		select * from assignments where id = ${typeof id === 'number' ? id : parseInt(id,10)}
		`);

		if(should_release)
			con.release();

		if(result.rows.length === 1) {
			return result.rows[0];
		} else {
			return undefined;
		}
	} catch(err) {
		if(con && should_release)
			con.release();

		throw err;
	}
};

module.exports = [
	[
		{
			path: id_files_path,
			type: 'mdlwr',
			methods: ['get','post','delete']
		},
		async (req,res) => {
			let con = null;

			try {
				con = await db.connect();

				let assignment = await getAssignmentData(req.params.id,con);

				con.release();

				if(assignment === undefined) {
					await res.endJSON(404,{
						'message': 'assignment not found id db'
					});
					return false;
				}

				req['assignment'] = assignment;
			} catch(err) {
				if(con)
					con.release();

				await res.endError(err);
				return false;
			}

			if(con)
				con.release();
		}
	],
	[
		{
			path: id_files_path,
			methods: 'get'
		},
		async (req,res) => {
			let con = null;

			try {
				con = await db.connect();

				await con.beginTrans();


			} catch(err) {

			}
		}
	]
];