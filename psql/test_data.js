const db = require('modules/psql');
const log = require('modules/log');
const setup = require('modules/setup');

const createUser = require('modules/psql/helpers/users/createUser');
const createImage = require('modules/psql/helpers/images/createImage');
const createAssignment = require('modules/psql/helpers/assignments/createAssignment');

class RunQuery {
	constructor(query_str,rtn_column) {
		this.query = query_str;
		this.rtn_column = rtn_column;
	}

	async run(con) {
		let res = await con.query(this.query);

		if(res.rows.length !== 0) {
			return res.rows[0][this.rtn_column];
		} else {
			return null;
		}
	}
}

let users = [
	[
		{'type': 'master'},
		{
			"username": "test_user",
			"password": "test_user",
			"email": "test_user@example.com",
			"fname": "test2",
			"lname": "bot",
			"permissions": {}
		}
	],
	[
		{'type': 'master'},
		{
			"username": "student_one",
			"password": "student_one",
			"fname": "student",
			"lname": "bot_one",
			"is_student": true
		}
	],
	[
		{'type': 'master'},
		{
			"username": "student_two",
			"password": "student_two",
			"is_student": true
		}
	],
	[
		{'type': 'master'},
		{
			"username": "teacher_one",
			"password": "teacher_one",
			"email": "teacher_one@example.com",
			"is_teacher": true
		}
	],
	[
		{'type': 'master'},
		{
			"username": "teacher_two",
			"password": "teacher_two",
			"email": "teacher_two@example.com",
			"is_teacher": true,
			"fname": "teacher",
			"lname": "bot_two"
		}
	]
];

let sections = [
	{
		"title": "CSCI 311",
		"num": 8398,
		"year": 2018,
		"semester": "fall",
		"teacher_id": "select id from users where username = 'teacher_two'"
	},
	{
		"title": "CINS 465",
		"num": 5216,
		"year": 2018,
		"semester": "spring",
		"teacher_id": "select id from users where username = 'teacher_one'"
	},
	{
		"title": "CSCI 211",
		"num": 6354,
		"year": 2017,
		"semester": "summer",
		"teacher_id": "select id from users where username = 'teacher_two'"
	},
	{
		"title": "CSCI 111",
		"num": 3524,
		"year": 2017,
		"semester": "winter",
		"teacher_id": "select id from users where username = 'teacher_one'"
	}
];

let images = [
	[
		async (con) => {
			let res = await con.query(`select * from users where username = 'teacher_two'`);

			return {
				"id": res.rows.length === 1 ? res.rows[0]['id'] : 0
			};
		},
		{
			"image_name": "node:9.10.0",
			"image_type": "hub"
		}
	],
	[
		async (con) => {
			let res = await con.query(`select * from users where username = 'teacher_two'`);

			return {
				"id": res.rows.length === 1 ? res.rows[0]['id'] : 0
			};
		},
		{
			"image_name": "ubuntu:16.04",
			"image_type": "hub"
		}
	],
	[
		async (con) => {
			let res = await con.query(`select * from users where username = 'teacher_two'`);

			return {
				"id": res.rows.length === 1 ? res.rows[0]['id'] : 0
			}
		},
		{
			"image_name": "postgres:10.1",
			"image_type": "hub"
		}
	],
	[
		async (con) => {
			let res = await con.query(`select * from users where username = 'teacher_one'`);

			return {
				"id": res.rows.length === 1 ? res.rows[0]['id'] : 0
			};
		},
		{
			"image_name": "node:8.11.1",
			"image_type": "hub"
		}
	],
	[
		async (con) => {
			let res = await con.query(`select * from users where username = 'teacher_one'`);

			return {
				"id": res.rows.length === 1 ? res.rows[0]['id'] : 0
			};
		},
		{
			"image_name": "redis:latest",
			"image_type": "hub",
		}
	],
	[
		async (con) => {
			let res = await con.query(`select * from users where username = 'teacher_one'`);

			return {
				"id": res.rows.length === 1 ? res.rows[0]['id'] : 0
			};
		},
		{
			"image_name": "node:6.14.1",
			"image_type": "hub",
		}
	]
];


let assignments = [
	[
		{'type': 'master'},
		{
			"title": "first assignment",
			"section_id": "select id from sections where title = 'CSCI 111'",
			"description": "the first assignment of the class",
			"points": 100,
			"options": {}
		}
	],
	[
		{'type': 'master'},
		{
			"title": "second assignment",
			"section_id": "select id from sections where title = 'CSCI 111'",
			"description": "the second assignment of the class",
			"points": 100,
			"options": {}
		}
	],
	[
		{'type': 'master'},
		{
			"title": "third assignment",
			"section_id": "select id from sections where title = 'CSCI 111'",
			"description": "the third assignment of the class",
			"points": 100,
			"options": {
				"exec": [
					"ls -val",
					"pwd",
					"cd /",
					"ls -val",
					"cd ~",
					"ls -val",
					"cd /app"
				],
				"extract": [
					"/etc"
				]
			}
		}
	],
	[
		{'type': 'master'},
		{
			"title": "fourth assignment",
			"section_id": "select id from sections where title = 'CSCI 111'",
			"description": "the fourth assignment of the class",
			"points": 100,
			"options": {}
		}
	]
];

let assignment_images = [
	{
		"image_id": "select id from images where image_name = 'node:9.10.0'",
		"assignment_id": "select assignments.id as id from assignments join sections on assignments.section_id = sections.id where assignments.title = 'first assignment' and sections.title = 'CSCI 111'"
	},
	{
		"image_id": "select id from images where image_name = 'node:9.10.0'",
		"assignment_id": "select assignments.id as id from assignments join sections on assignments.section_id = sections.id where assignments.title = 'second assignment' and sections.title = 'CSCI 111'"
	},
	{
		"image_id": "select id from images where image_name = 'node:9.10.0'",
		"assignment_id": "select assignments.id as id from assignments join sections on assignments.section_id = sections.id where assignments.title = 'third assignment' and sections.title = 'CSCI 111'"
	}
];

let submissions = [
	{
		"users_id": new RunQuery("select id from users where username = 'student_one'",'id'),
		"assignment_id": new RunQuery("select assignments.id as id from assignments join sections on assignments.section_id = sections.id where assignments.title = 'third assignment' and sections.title = 'CSCI 111'",'id'),
		"image_id": new RunQuery("select id from images where image_name = 'node:9.10.0'",'id')
	},
	{
		"users_id": new RunQuery("select id from users where username = 'student_one'",'id'),
		"assignment_id": new RunQuery("select assignments.id as id from assignments join sections on assignments.section_id = sections.id where assignments.title = 'third assignment' and sections.title = 'CSCI 111'",'id'),
		"image_id": new RunQuery("select id from images where image_name = 'node:9.10.0'",'id')
	},
	{
		"users_id": new RunQuery("select id from users where username = 'student_one'",'id'),
		"assignment_id": new RunQuery("select assignments.id as id from assignments join sections on assignments.section_id = sections.id where assignments.title = 'third assignment' and sections.title = 'CSCI 111'",'id'),
		"image_id": new RunQuery("select id from images where image_name = 'node:9.10.0'",'id')
	}
];

const getArguments = async (data,con) => {
	let args = [];

	for(let a of data) {
		if(typeof a === 'function') {
			let rtn = a(con);

			if(typeof rtn.then === 'function') {
				args.push(await rtn);
			} else {
				args.push(rtn);
			}
		} else {
			args.push(a);
		}
	}

	return [...args,con];
};

const createUsers = async (con) => {
	for(let data of users) {
		let args = await getArguments(data,con);

		let result = await createUser(...args);

		if(!result.success && result.reason !== 'username already used') {
			log.warn(`failed to create user: ${result.reason}`);
		}
	}
};

const createSections = async (con) => {
	for(let data of sections) {
		let get_teacher = await con.query(data.teacher_id);

		if(get_teacher.rows.length === 1) {
			data['teacher_id'] = get_teacher.rows[0]['id'];

			let insert = new db.util.QueryBuilder();

			insert.strField('title',data['title']);
			insert.numField('num',data['num']);
			insert.numField('year',data['year']);
			insert.strField('semester',data['semester']);
			insert.numField('teacher_id',data['teacher_id']);

			let query = `
			insert into sections (${insert.getFieldsStr()}) values
			(${insert.getValuesStr()})
			on conflict on constraint unique_sections do update
				set ${insert.getInsertStr()}
				where
					sections.num = ${insert.getValueStr('num')} and
					sections.year = ${insert.getValueStr('year')} and
					sections.semester = ${insert.getValueStr('semester')}
			returning *`;

			let res = await con.query(query);

			if(res.rows.length !== 1)
				log.warn(`failed to create section`);
		} else {
			log.warn('failed to get teacher for section');
		}
	}
};

const createImages = async (con) => {
	for(let data of images) {
		let args = await getArguments(data,con);

		let result = await createImage(...args);

		if(!result.success && result.reason !== 'image name already used') {
			log.warn(`failed to create image: ${result.reason}`);
		}
	}
};

const createAssignments = async (con) => {
	for(let data of assignments) {
		let args = await getArguments(data,con);

		let ins_data = args[1];

		let section_id = await con.query(ins_data['section_id']);

		if(section_id.rows.length === 1) {
			ins_data['section_id'] = section_id.rows[0]['id'];

			let res = await createAssignment(...args);

			if(!res.success)
				log.warn(`unable to create assignment: ${res.reason}`);
		} else {
			log.warn('unable to get section_id');
		}
	}
};

const createAssignmentImages = async (con) => {
	for(let data of assignment_images) {
		let image_id_res = await con.query(data['image_id']);
		let assignment_id_res = await con.query(data['assignment_id']);

		if(image_id_res.rows.length === 1 && assignment_id_res.rows.length === 1) {
			data['image_id'] = image_id_res.rows[0]['id'];
			data['assignment_id'] = assignment_id_res.rows[0]['id'];

			let insert = new db.util.QueryBuilder();

			insert.numField('image_id',data['image_id']);
			insert.numField('assignment_id',data['assignment_id']);

			let insert_query = `
			insert into assignment_images (${insert.getFieldsStr()}) values
			(${insert.getValuesStr()})
			on conflict on constraint image_assignment_pk do update
				set ${insert.getInsertStr()}
				where
					assignment_images.image_id = ${insert.getValueStr('image_id')} and
					assignment_images.assignment_id = ${insert.getValueStr('assignment_id')}
			returning *`;

			let res = await con.query(insert_query);

			if(res.rows.length !== 1)
				log.warn('failed to assign image to assignment');
		} else {
			log.warn('failed to get assignment_id or image_id');
		}
	}
};

const createSubmissions = async (con) => {
	let check_query = `
		select *
		from submissions`;

	let check_res = await con.query(check_query);

	if(check_res.rows.length === submissions.length) {
		return;
	}

	for(let data of submissions) {
		let keys = Object.keys(data);

		for(let k of keys) {
			if(data[k] instanceof RunQuery) {
				data[k] = await data[k].run(con);
			}
		}

		let insert = new db.util.QueryBuilder();

		for(let k of keys) {
			insert.typeofField(k,data[k]);
		}

		let insert_query = `
		insert into submissions (${insert.getFieldsStr()}) values
		(${insert.getValuesStr()})
		returning *`;

		let res = await con.query(insert_query);

		if(res.rows.length !== 1) {
			log.warn('unable to create submission');
		}
	}
};

let run_ops = false;

const run = async () => {
	if(run_ops)
		return;

	let con = null;
	let run_list = [
		createUsers,
		createSections,
		createImages,
		createAssignments,
		createAssignmentImages,
		createSubmissions
	];

	try {
		con = await db.connect();
	} catch(err) {
		log.error(`connecting to database for test data: ${err.stack}`);
	}

	if(con === null) {
		log.warn('no database connection');
		return;
	}

	for(let fn of run_list) {
		try {
			await con.beginTrans();

			await fn(con);

			await con.commitTrans();
		} catch(err) {
			await con.rollbackTrans();

			log.error(`running test data method: ${err.stack}`);
		}
	}

	con.release();

	run_ops = true;
};

module.exports = run;