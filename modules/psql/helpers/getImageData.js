const db = require('modules/psql');

/**
 *
 * @param id  {number|string}
 * @param con {SQLConnection=}
 * @returns {Promise<{
 *     id: number
 *     name: string
 *     docker_id: string
 *     options: Object
 *     type: string
 *     status: string
 *     exists: boolean
 *     dockerfile: boolean
 *     url: string
 *     user: {
 *         id: number
 *         username: string
 *     }
 * }|undefined>}
 */
const getImageData = async (id,con) => {
	let res = await con.query(`
		select 
			images.id,
			images.image_name as name,
			images.docker_id,
			images.options,
			images.image_type as type,
			images.image_status as status,
			images.image_exists as exists,
			images.dockerfile as dockerfile,
			images.image_url as url,
			users.id as user__id,
			users.username as user__username
		from images 
		join users on
			users.id = images.image_owner
		where 
			images.id = ${typeof id === 'number' ? id : parseInt(id,10)}
	`);

	let parse = db.util.createObject(res.rows);

	if(parse.length === 1) {
		return parse[0];
	} else {
		return undefined
	}
};

module.exports = getImageData;