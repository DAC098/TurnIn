const n_path = require('path');

const _ = require('lodash');
const tar = require('tar');

const db = require('modules/psql');
const File = require('modules/fs/File');
const Dir = require('modules/fs/Dir');
const log = require('modules/log');
const setup = require('modules/setup');
const listImages = require('modules/psql/helpers/images/listImages');

const isJsonContent = require('modules/middleware/isJsonContent');
const variables = require('modules/variables');

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
				let options  = {};

				if(req.user.type === 'master' || req.user.permission.image.modify) {
					options.below_user = req.user.type;
				} else {
					options.owner_id = req.user.id;
				}

				let result = await listImages(options,con);

				await res.endJSON({
					'length': result.length,
					'result': result
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
				 *     image_name: string,
				 *     options: variables.default_image_options,
				 *     image_type: string,
				 *     image_url: string,
				 *     dockerfile: string=
				 * }}
				 */
				let body = await parser.json(req);
				let insert_fields = ['image_owner'];
				let insert_values = [req.user.id];

				if(body.image_name) {
					let result = await con.query(`select * from images where image_name = '${body.image_name}'`);

					if(result.rows.length !== 0) {
						await res.endJSON(400,{
							'message': 'image name already used'
						});
						return;
					}

					insert_fields.push('image_name');
					insert_values.push(`'${body.image_name}'`);
				} else {
					await res.endJSON({
						'message': 'no image name given'
					});
					return;
				}

				if(body.options) {
					insert_fields.push('options');
					insert_values.push(`'${JSON.stringify(_.merge({},variables.default_image_options,body.options))}'`);
				} else {
					insert_fields.push('options');
					insert_values.push(`'${JSON.stringify(variables.default_image_options)}'`);
				}

				if(body.image_type) {
					if(body.image_type in variables.image_types) {
						insert_values.push(`'${body.image_type}'`);
						insert_fields.push('image_type');
					} else {
						await res.endJSON(400,{
							'message': 'invalid type given for image type'
						});
					}
				}

				if(body.image_url) {
					insert_fields.push('image_url');
					insert_values.push(`'${body.image_url}'`);
				}

				let query = `insert into images (${insert_fields.join(',')}) values (${insert_values.join(',')}) returning *`;

				let result = await con.query(query);

				if(body.dockerfile && result.rows.length === 1) {
					let image_data = result.rows[0];
					let iteration = 1;
					let dockerfile_path = `/tmp/Dockerfile_${Date.now()}`;

					try {
						while(await (Dir.exists(dockerfile_path + '_' + iteration)))
							++iteration;

						dockerfile_path = dockerfile_path + '_' + iteration;

						await Dir.make(dockerfile_path);
						await File.write(`${dockerfile_path}/Dockerfile`,body.dockerfile);

						await tar.create({
							gzip: false,
							file: n_path.join(
								setup.helpers.getImageDir(image_data.id),
								'Dockerfile.tar'
							),
							cwd: dockerfile_path
						},['Dockerfile']);

						let tar_result = await con.query(`
						update images set dockerfile = true where id = ${image_data.id}
						`);

						await Dir.remove(dockerfile_path,true);

						log.info('created dockerfile tar archive');
					} catch(err) {
						log.error(`failed to create Dockerfile tar archive for image: ${err.stack}`);
					}
				}

				await res.endJSON({
					'length': result.rows.length,
					'result': result.rows.length === 1 ? [result.rows[0]] : []
				});
			} catch(err) {
				await res.endError(err);
			}

			if(con)
				con.release();
		}
	]
];
