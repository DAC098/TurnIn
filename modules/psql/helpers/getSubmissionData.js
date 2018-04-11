const db = require('../index');

/**
 *
 * @param id  {number}
 * @param con {SQLConnection}
 * @returns {Promise<{
 *     id: number,
 *     users_id: number,
 *     assignment_id: number,
 *     past_due: boolean,
 *     sub_date: string
 *     options: Object|null,
 *     comment: string|null,
 *     image: {
 *         id: number,
 *         name: string,
 *         options: Object,
 *         type: string,
 *         status: string
 *     }
 * }|undefined>}
 */
const getSubmissionData = async (id,con) => {
	let query = `
	select
		submissions.*,
		images.id as image__id,
		images.image_name as image__name,
		images.options as image__options,
		images.image_type as image__type,
		images.image_status as image__status
	from submissions
	left join images on
		images.id = submissions.image_id
	where
		submissions.id = ${id}`;

	let result = await con.query(query);
	let submission = db.util.createObject(result.rows);

	if(submission.length === 1) {
		return submission[0];
	} else {
		return undefined;
	}
};

module.exports = getSubmissionData;