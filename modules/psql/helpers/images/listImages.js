const db = require('../../index');

/**
 *
 * @param options {{
 *     id: number,
 *     owner_id: boolean,
 *     below_user: user_type_map,
 *     above_user: user_type_map,
 *     check_owner: number,
 *     limit: number,
 *     offset: number
 * }}
 * @param con     {SQLConnection=}
 * @returns {Promise<Array>}
 */
const listImages = async (options,con) => {
	let given_con = con !== null && con !== undefined;

	try {
		if(!given_con)
			con = await db.connect();

		let where = [],
		    query = `
		select
			images.*,
			users.username as username`;

		if(typeof options.check_owner === 'number') {
			query += `,
			case when images.image_owner = ${options.check_owner} then TRUE else FALSE end as is_owner`;
		}

		query += `
		from images
		join users on
			images.image_owner = users.id
		`;

		if(options.id) {
			where.push(`images.id = ${options.id}`);
		}

		if(options.owner_id) {
			where.push(`images.image_owner = ${options.owner_id}`);
		}

		if(options.below_user) {
			where.push(`users.type <= '${options.below_user}'`);
		}

		if(options.above_user) {
			where.push(`users.type >= '${options.above_user}'`);
		}

		if(where.length !== 0) {
			query += `where
			${where.join (' and ')}
		`;
		}

		query += `order by
			images.image_name
		`;

		if(options.limit) {
			query += `limit ${options.limit}
		`;
		}

		if(options.offset) {
			query += `offset ${options.offset}
		`;
		}

		let result = await con.query(query);

		if(!given_con)
			con.release();

		return result.rows;
	} catch(err) {
		if(con && !given_con)
			con.release();

		throw err;
	}
};

module.exports = listImages;