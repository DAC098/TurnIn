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
 *     user: {
 *         id: number,
 *         name: {
 *             first: string|null,
 *             last: string|null
 *         },
 *         email: string|null,
 *         username: string
 *     },
 *     image: {
 *         id: number,
 *         name: string,
 *         options: Object,
 *         type: string,
 *         status: string
 *     },
 *     files: {
 *         name: string
 *     }[]
 * }|undefined>}
 */
const getSubmissionData = async (id,con) => {
	let query = `
	select
		submissions.*,
		users.id as user__id,
		users.username as user__username,
		users.email as user__email,
		users.fname as user__name__first,
		users.lname as user__name__last,
		images.id as image__id,
		images.image_name as image__name,
		images.options as image__options,
		images.image_type as image__type,
		images.image_status as image__status,
		submitted_files.filename as files__name
	from submissions
	left join submitted_files on
		submitted_files.submission_id = submissions.id
	left join images on
		images.id = submissions.image_id
	join users on
		users.id = submissions.users_id
	where
		submissions.id = ${id}`;

	let result = await con.query(query);
	let submission = db.util.createObject(result.rows,{array_keys:['files']});

	if(submission.length === 1) {
		return submission[0];
	} else {
		return undefined;
	}
};

module.exports = getSubmissionData;