const n_path = require("path");

const _ = require('lodash');
const tar = require('tar');

const db = require('../../index');
const setup = require('../../../setup');
const log = require('../../../log');

const Dir = require('../../../fs/Dir');
const File = require('../../../fs/File');

const variables = require('../../../variables');

/**
 *
 * @param user
 * @param body {{
 *     image_name: string,
 *     options: variables.default_image_options,
 *     image_type: string,
 *     image_url: string,
 *     dockerfile: string=
 * }}
 * @param con SQLConnection
 * @returns {Promise<{
 *     success: boolean
 *     reason: string=
 *     image: Object=
 * }>}
 */
const createImage = async (user,body,con) => {
	let insert_data = new db.util.QueryBuilder();

	insert_data.numField('image_owner',user.id);

	if(body.image_name) {
		let result = await con.query(`select * from images where image_name = '${body.image_name}'`);

		if(result.rows.length !== 0) {
			return {
				success: false,
				reason: 'image name already used'
			};
		}

		insert_data.strField('image_name',body.image_name);
	} else {
		return {
			success: false,
			reason: 'no image name given'
		};
	}

	if(body.options) {
		insert_data.strField('options',JSON.stringify(_.merge({},variables.default_image_options,body.options)));
	} else {
		insert_data.strField('options',JSON.stringify(variables.default_image_options));
	}

	if(body.image_type) {
		if(body.image_type in variables.image_types) {
			insert_data.strField('image_type',body.image_type);
		} else {
			return {
				success: false,
				reason: 'invalid type given for image type'
			};
		}
	}

	if(body.image_url) {
		insert_data.strField('image_url',body.image_url);
	}

	let query = `insert into images (${insert_data.getFieldsStr()}) values (${insert_data.getValuesStr()}) returning *`;

	let result = await con.query(query);

	if(body.dockerfile && result.rows.length === 1) {
		let image_data = result.rows[0];
		let iteration = 1;
		let dockerfile_path = `/tmp/Dockerfile_${Date.now()}`;

		try {
			while(await Dir.exists(dockerfile_path + '_' + iteration))
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

			let tar_result = await con.query(`update images set dockerfile = true where id = ${image_data.id}`);

			image_data['dockerfile'] = true;

			await Dir.remove(dockerfile_path,true);

			log.info('created dockerfile tar archive');
		} catch(err) {
			log.error(`failed to create Dockerfile tar archive for image: ${err.stack}`);
		}
	}

	return {
		success: true,
		image: result.rows[0]
	};
};

module.exports = createImage;