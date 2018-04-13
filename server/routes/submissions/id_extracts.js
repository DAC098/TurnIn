const fs = require('fs');
const n_path = require('path');

const setup = require('modules/setup');
const log = require('modules/log');
const File = require('modules/fs/File');
const pump = require('modules/streaming/asyncPump');

const id_extract_path = '/:id([0-9]+)/extracts';
module.exports = [
	[
		{
			path: id_extract_path,
			methods: 'get'
		},
		async (req,res) => {
			let extract_json_path = n_path.join(
				setup.getKey('directories.data_root'),
				'submissions',
				`${req.submission.id}`,
				'extracts',
				'data.json'
			);

			if(!await File.exists(extract_json_path)) {
				await res.endJSON(404,{
					'message': 'no extracts found'
				});
				return;
			}

			try {
				let extracts_json = JSON.parse(await File.read(extract_json_path));
				let download = req.url_parsed.searchParams.get('download');
				let extract_path = req.url_parsed.searchParams.get('path');

				if(download !== null && extract_path !== null) {
					let found = false;
					log.info('searching for extract',{
						container: download,
						path: extract_path
					});

					for(let run of extracts_json.runs) {
						if(run.container.Id === download) {
							for(let r of run.results) {
								if(r.path === extract_path && !found) {
									found = true;

									let read_file = fs.createReadStream(n_path.join(
										setup.getKey('directories.data_root'),
										'submissions',
										`${req.submission.id}`,
										'extracts',
										r.filename
									));

									res.writeHead(200,{
										'content-type': '',
										'content-disposition': `attachment; filename=${r.filename}`
									});

									await pump(read_file,res);
								}
							}
						}
					}

					if(!found)
						await res.endJSON(404,{
							'message': 'extract not found'
						});
				} else {
					await res.endJSON(extracts_json);
				}
			} catch(err) {
				await res.endError(err);
			}
		}
	]
];