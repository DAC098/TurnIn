const fs = require('fs');
const n_path = require("path");

const setup = require('modules/setup');
const db = require('modules/psql');

const pump = require('modules/streaming/asyncPump');

const id_submission_files = '/:id([0-9]+)/files';

module.exports = [
	[
		{
			path: id_submission_files,
			methods: 'get'
		},
		async (req,res) => {
			try {
				let download = req.url_parsed.searchParams.get('download');

				if(download !== null) {
					let found = false;

					for(let file of req.submission.files) {
						if(file.name === download) {
							found = true;

							let read_file = fs.createReadStream(n_path.join(
								setup.getKey('directories.data_root'),
								'submissions',
								`${req.submission.id}`,
								file.name
							));

							res.writeHead(200,{
								'content-type': '',
								'content-disposition': `attachment; filename=${file.name}`
							});

							await pump(read_file,res);
						}
					}

					if(!found) {
						await res.endJSON(404,{
							'message': 'file not found for submission'
						});
					}
				} else {
					await res.endJSON({
						'length': req.submission.files.length,
						'result': req.submission.files
					});
				}
			} catch(err) {
				await res.endError(err);
			}
		}
	],
	[
		{
			path: id_submission_files,
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

					for(let file of req.submission.files) {
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
						setup.getKey('directories.data_root'),
						'submissions',
						`${req.submission.id}`,
						name
					);

					con = await db.connect();

					await con.beginTrans();

					let query = `
					insert into submission_files values('${name}',${req.submission.id})
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
				if(con)
					await con.rollbackTrans();

				await res.endError(err);
			}

			if(con)
				con.release();
		}
	]
];