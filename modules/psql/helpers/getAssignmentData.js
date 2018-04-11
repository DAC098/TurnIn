const db = require('../index');

/**
 *
 * @param id  {number}
 * @param con {SQLConnection}
 * @returns {Promise<{
 *     id: number,
 *     title: string,
 *     section_id: number,
 *     description: string|null,
 *     points: number,
 *     open_date: string|null,
 *     close_data: string|null,
 *     allow_custom_images: boolean,
 *     images: {
 *         id: number,
 *         name: string,
 *         options: Object,
 *         type: string,
 *         status: string
 *     }[],
 *     files: {
 *         name: string
 *     }[]
 * }>|undefined}
 */
const getAssignmentData = async(id,con) => {
	let query = `
	select 
		assignments.*,
		assignment_files.filename as files__name,
		images.id as images__id,
		images.image_name as images__name,
		images.options as images__options,
		images.image_type as images__type,
		images.image_status as images__status
	from assignments
	left join assignment_files on
		assignment_files.assignment_id = assignments.id
	left join assignment_images on 
		assignment_images.assignment_id = assignments.id
	left join images on
		images.id = assignment_images.image_id
	where
		assignments.id = ${id}
	order by
		assignments.title`;

	let result = await con.query(query);
	let assignment = db.util.createObject(result.rows,{array_keys:['files','images']});

	if(assignment.length === 1) {
		return assignment[0];
	} else {
		return undefined;
	}
};

module.exports = getAssignmentData;
