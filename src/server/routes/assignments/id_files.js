const fs = require('fs');
const n_path = require('path');

const setup = require('modules/setup');
const db = require('modules/psql');

const pump = require('modules/streaming/asyncPump');
const File = require('modules/fs/File');

const id_files_path = '/:id([0-9]+)/files';

module.exports = [
	[
		{
			path: id_files_path,
			methods: 'get'
		},
		async (req,res) => {
			try {
				let download = req.url_parsed.searchParams.get('download');

				if(download !== null) {
					let found = false;

					for(let file of req.assignment.files) {
						if(file.name === download) {
							found = true;

							let read_file = fs.createReadStream(n_path.join(
								setup.helpers.getAssignmentDir(req.assignment.id),
								file.name
							));

							res.writeHead(200,{
								'content-type': '',
								'content-disposition': `attachment; filename="${file.name}"`
							});

							await pump(read_file,res);
							break;
						}
					}

					if(!found) {
						await res.endJSON(404,{
							'message': 'file not found for assignment'
						});
					}
				} else {
					await res.endJSON({
						'length': req.assignment.files.length,
						'result': req.assignment.files
					});
				}
			} catch(err) {
				await res.endError(err);
			}
		}
	],
	[
		{
			path: id_files_path,
			methods: 'post'
		},
		async (req,res) => {
			let con = null;

			try {
				let name = req.url_parsed.searchParams.get('name');

				if(name === null) {
					await res.endJSON(400,{
						'message': 'no name given for file'
					});
				} else {
					let found = false;

					for(let file of req.assignment.files) {
						if(file.name === name)
							found = true;
					}

					if(found) {
						await res.endJSON(400,{
							'message': 'file already exists'
						});
						return;
					}

					let file_path = n_path.join(
						setup.helpers.getAssignmentDir(req.assignment.id),
						name
					);

					con = await db.connect();

					await con.beginTrans();

					let query = `
					insert into assignment_files values('${name}',${req.assignment.id})
					returning *`;

					let result = await con.query(query);

					if(result.rows.length !== 1) {
						await res.endJSON(400,{
							'message': 'unable to update database'
						});

						await con.rollbackTrans();

						con.release();

						return;
					}

					let write_file = fs.createWriteStream(file_path);

					await pump(req,write_file);

					await con.commitTrans();

					await res.endJSON({
						'message': 'ok'
					});
				}
			} catch(err) {
				if(con) {
					await con.rollbackTrans();
				}

				await res.endError(err);
			}

			if(con)
				con.release();
		}
	],
	[
		{
			path: id_files_path,
			methods: 'delete'
		},
		async (req,res) => {
			let con = null;

			try {
				let name = req.url_parsed.searchParams.get('name');
				let dir_path = n_path.join(
					setup.getKey('directories.data_root'),
					'assignments',
					`${req.assignment.id}`
				);

				if(name) {
					let found = false;

					for(let file of req.assignment.files) {
						if(file.name === name) {
							found = true;

							con = await db.connect();

							await con.beginTrans();

							let query = `
							delete from assignment_files
							where filename = '${file.name}' and assignment_id = ${req.assignment.id}
							returning *`;

							let result = await con.query(query);

							if(result.rows.length === 1) {
								await File.remove(`${dir_path}/${file.name}`);

								await con.commitTrans();

								await res.endJSON({
									'message': 'file removed'
								});
							} else {
								await con.rollbackTrans();

								await res.endJSON(500,{
									'message': 'unable to delete file'
								});
							}
						}
					}
				} else {
					con = await db.connect();

					let query = `
					delete from assignment_files
					where assignment_id = ${req.assignment.id}
					returning *`;

					await con.beginTrans();

					let result = await con.query(query);

					if(result.rows.length = req.assignment.files.length) {
						for(let file of req.assignment.files) {
							await File.remove(`${dir_path}/${file}`);
						}

						await con.commitTrans();

						await res.endJSON({
							'message': 'deleted all assignment files'
						});
					} else {
						await con.rollbackTrans();

						await res.endJSON(500,{
							'message': 'unable to delete files for assignment'
						});
					}
				}
			} catch(err) {
				if(con)
					await con.rollbackTrans();

				await res.endError(err,'unable to delete files from assignment');
			}

			if(con)
				con.release();
		}
	]
];