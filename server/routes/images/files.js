const fs = require('fs');
const n_path = require('path');

const setup = require('modules/setup');
const db = require('modules/psql');

const File = require('modules/fs/File');
const Dir = require('modules/fs/Dir');
const pump = require('modules/streaming/asyncPump');

const dockerfile_url = '/:id([0-9]+)/dockerfile';

/**
 *
 * @param id  {number|string}
 * @param con {SQLConnection=}
 * @returns {Promise<Object|undefined>}
 */
const getImageData = async (id,con) => {
	let should_release = false;

	try {
		if(con === null) {
			should_release = true;
			con = await db.connect();
		}

		let res = await con.query(`
		select * from images where id = ${typeof id === 'number' ? id : parseInt(id,10)}
		`);

		if(should_release)
			con.release();

		if(res.rows.length === 1) {
			return res.rows[0];
		} else {
			return undefined
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
			path: dockerfile_url,
			type: 'mdlwr',
			methods: ['get','post','delete']
		},
		async (req,res) => {
			let con = null;

			try {
				con = await db.connect();

				let image = await getImageData(req.params.id,con);

				if(image === undefined) {
					await res.endJSON({
						'message': 'image not found in db'
					});
					return false;
				}

				req['image'] = image;
			} catch(err) {
				if(con)
					con.release();

				await res.endError(err);
				return false;
			}
		}
	],
	[
		{
			path: dockerfile_url,
			methods: 'get'
		},
		async (req,res) => {
			try {
				let dockerfile_path = n_path.join(setup.getKey('directories.data_root'),'images',req.image.id,'Dockerfile');

				if(await File.exists(dockerfile_path)) {
					let dockerfile_read = fs.createReadStream(dockerfile_path);

					res.writeHead(200);

					await pump(dockerfile_read,res);

					res.end();
				} else {
					await res.endJSON(400,{
						'message': 'dockerfile not found for image'
					});
				}
			} catch(err) {
				await res.endError(err);
			}
		}
	],
	[
		{
			path: dockerfile_url,
			methods: 'post'
		},
		async (req,res) => {
			let con = null;
			try {
				con = await db.connect();

				await con.beginTrans();

				let dockerfile_path = n_path.join(setup.getKey('directories.data_root'),'images',req.params.id,'Dockerfile');

				if(!await Dir.exists(n_path.dirname(dockerfile_path)))
					await Dir.make(n_path.dirname(dockerfile_path));

				let dockerfile_write = fs.createWriteStream(dockerfile_path);

				if(req.readable) {
					await pump(req,dockerfile_write);

					dockerfile_write.end();

					let result = await con.query(`update images set dockerfile = true where id = ${req.image.id}`);

					await res.endJSON({
						'message': 'ok'
					});
				} else {
					await res.endJSON(400,{
						'message':'request stream is not readable'
					});
				}

				await con.commitTrans();
				con.release();
			} catch(err) {
				if(con) {
					await con.rollbackTrans();
					con.release();
				}

				await res.endError(err);
			}
		}
	],
	[
		{
			path: dockerfile_url,
			methods: 'delete'
		},
		async (req,res) => {
			let con = null;
			try {
				let pool = db.getPool();
				con = await pool.connect();

				await con.beginTrans();

				let dockerfile_path = n_path.join(setup.getKey('directories.data_root'),'images',req.image.id,'Dockerfile');

				if(await File.exists(dockerfile_path)) {
					await File.remove(dockerfile_path);

					let result = await con.query(`update images set dockerfile = false where id = ${req.image.id}`);

					await res.endJSON({
						'message':'ok'
					});
				} else {
					await res.endJSON({
						'message': 'docker file does not exists for image'
					});
				}

				await con.commitTrans();
				con.release();
			} catch(err) {
				if(con) {
					await con.rollbackTrans();
					con.release();
				}

				await res.endError(err);
			}
		}
	]
];