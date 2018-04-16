const n_path = require('path');
const fs = require("fs");

const db = require('modules/psql');
const parser = require('modules/parser');
const setup = require('modules/setup');
const log = require('modules/log');

const File = require('modules/fs/File');
const images = require('modules/docker/images');

const router = require("../router");

const in_progress = new Set();

router.addRoute({
	path: '/build',
	methods: 'post'
},async (req,res) => {
	let con = null;

	/**
	 *
	 * @type {{
	 *     image_id: number
	 * }}
	 */
	let build_request = {};
	let image_info = {};

	let check = req.url_parsed.searchParams.has('check');

	try {
		con = await db.connect();

		build_request = await parser.json(req);

		let query =`
		select
			*
		from images
		where
			id = ${build_request.image_id}`;

		let result = await con.query(query);

		con.release();

		if(result.rows.length !== 1) {
			await res.endJSON(404,{
				'message': 'did not find image'
			});
		}

		image_info = result.rows[0];

		if(image_info.image_type === 'hub') {
			await res.endJSON(202,{
				'message': 'image is on hub'
			});
			return;
		}

		if(in_progress.has(image_info.id)) {
			await res.endJSON(202,{
				'message': 'in-progress'
			});
			return;
		} else {
			if(!check)
				in_progress.add(image_info.id);

			await res.endJSON(202,{
				'message': check ? 'not-started' : 'started'
			});
		}
	} catch(err) {
		if(con)
			con.release();

		await res.endError(err);

		return;
	}

	if(check)
		return;

	let build_image = null;

	let images_dir = n_path.join(
		setup.getKey('directories.data_root'),
		'images',
		`${image_info.id}`
	);

	log.info('building image',{
		image_id: image_info.id
	});

	let wait_on = null;

	try {
		let output_file = n_path.join(images_dir,'build_output.txt');

		if(await File.exists(output_file))
			await File.write(output_file,'');

		let result = await images.build(n_path.join(images_dir,'Dockerfile.tar'),{
			rm: true,
			labels: {
				'com.turnin': 'true',
				'com.turnin.image_id': `${image_info.id}`
			},
			no_cache: true
		});
		let output = fs.createWriteStream(output_file);

		if(result.success) {
			wait_on = new Promise((resolve,reject) => {
				let read = result.returned;

				read.on('data',chunk => {
					let json = JSON.parse(chunk.toString('utf8'));

					if(json.stream) {
						output.write(json.stream);
					} else {
						if(json.error) {
							output.write(json.error);

							log.warn(`build error: code[${json.errorDetail.code}] ${json.error}`,{
								image_id: image_info.id
							});
						} else if(json.aux) {
							build_image = json.aux;
						} else {
							log.info('returned',json);
						}
					}
				});

				read.on('end',() => {
					resolve();
				});

				read.on('error',err => {
					reject(err);
				});
			});
		} else {
			log.warn('unable to build image',{
				image_id: image_info.id,
				data: result.returned
			});
		}
	} catch(err) {
		log.error(`building image: ${err.stack}`,{
			image_id: image_info.id
		});
	}

	if(wait_on !== null) {
		log.info('waiting on build');

		try {
			await wait_on;
		} catch(err) {
			log.error(`building image: ${err.stack}`,{
				image_id: image_info.id
			});
		}

		in_progress.delete(image_info.id);
	}

	if(build_image !== null) {
		try {
			con = await db.connect();

			let query = `
			update images 
			set docker_id = '${build_image.ID}'
			where
				images.id = ${image_info.id}
			returning *`;

			let result = await con.query(query);

			con.release();

			if(result.rows.length === 1) {
				log.info('successfully built image')
			} else {
				log.warn('failed to update db with image id');
			}
		} catch(err) {
			if(con)
				con.release();

			log.error(`db update: ${err.stack}`,{
				image_id: image_info.id
			});
		}
	}
});